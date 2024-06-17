const { kafka } = require("../setup-kafka/client");
const { Client } = require("cassandra-driver");
const axios = require("axios");
const winston = require("winston");

// Cassandra Connection Details
const cassandraClient = new Client({
  contactPoints: ["localhost:9042"],
  localDataCenter: "datacenter1",
  keyspace: "follower_data",
});

// Mockstagram API Url
const API_URL = "http://localhost:3000/api/v1/influencers/";

// Cassandra Queries
// Fetch Average
const fetchAverageQuery = `
  SELECT average,count 
  FROM averages
  WHERE id = ?
  LIMIT 1;
`;

// Insert current follower data for influencer
const insertFollowerCountQuery = `
  INSERT INTO follower_count (id,timestamp,count)
  VALUES (?,?,?) 
`;

// Insert average follower count for influencer
const insertAverageCountQuery = `
  INSERT INTO averages (id,timestamp,average,count)
  VALUES (?,?,?,?);
`;

// Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${level}] ${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

// Get Current Average for Influencer
async function insertIntoFollowerTable(id, timestamp, follower_count) {
  try {
    const result = await cassandraClient.execute(
      insertFollowerCountQuery,
      [id, timestamp, follower_count],
      { prepare: true }
    );
    logger.info(`Inserted follower count for influencer ${id}`);
  } catch (err) {
    logger.error(`Error inserting follower count for influencer ${id}: ${err}`);
  }
}

async function insertIntoAverageTable(id, timestamp, average, count) {
  try {
    const result = await cassandraClient.execute(
      insertAverageCountQuery,
      [id, timestamp, average, count],
      { prepare: true }
    );
    logger.info(`Inserted average follower count for influencer ${id}`);
  } catch (err) {
    logger.error(
      `Error inserting average follower count for influencer ${id}: ${err}`
    );
  }
}

async function getFollowerAverage(id) {
  let average = 0;
  let count = 0;

  try {
    const result = await cassandraClient.execute(fetchAverageQuery, [id], {
      prepare: true,
    });

    if (result.rowLength > 0) {
      average = result.rows[0].average;
      count = result.rows[0].count;
    }
  } catch (err) {
    logger.error(
      `Error fetching follower average for influencer ${id}: ${err}`
    );
  }

  return { average, count };
}

// Get Follower count from Mockstagram for Influencer
async function callMockstagram(id) {
  let data = { id: 0, followerCount: 0 };

  try {
    const response = await axios.get(API_URL + id);
    data.id = response.data.pk;
    data.followerCount = response.data.followerCount;
  } catch (err) {
    logger.error(`Error fetching follower count for influencer ${id}: ${err}`);
  }

  return data;
}

const group = process.argv[2];

async function init() {
  const consumer = kafka.consumer({ groupId: group });
  await consumer.connect();

  await consumer.subscribe({ topics: ["influencer-ids"] });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const startTime = Date.now();
      const timestamp = Math.floor(startTime / (1000)) * 1000;

      const obj = JSON.parse(message.value);
      for (let i = obj.start; i < obj.end; i++) {
        const result = await callMockstagram(i);

        await insertIntoFollowerTable(result.id, timestamp, result.followerCount);

        const currentAverages = await getFollowerAverage(result.id);
        let newAverage;
        if (currentAverages.count > 0) {
          newAverage =
            (currentAverages.average +
              result.followerCount / currentAverages.count) /
            ((currentAverages.count + 1) / currentAverages.count);
        } else {
          newAverage = result.followerCount;
        }
        await insertIntoAverageTable(
          result.id,
          timestamp,
          newAverage,
          currentAverages.count + 1
        );
      }
      logger.info(
        `${group}: [${topic}]: PART:${partition}:`,
        message.value.toString()
      );
    },
  });
}

init().catch((err) => {
  logger.error("Error in init function:", err);
});