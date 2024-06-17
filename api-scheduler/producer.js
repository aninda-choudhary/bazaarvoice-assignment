const { kafka } = require("../setup-kafka/client");
const { Partitioners } = require("kafkajs");
const winston = require("winston");

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "producer.log" }),
  ],
});

async function sendMessages(startId, endId) {
  const producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  try {
    logger.info("Connecting Producer");
    await producer.connect();
    logger.info("Producer Connected Successfully");

    for (let i = startId; i < endId; i += 10) {
      const start = i;
      const end = Math.min(i + 10, endId);
      logger.info(`Sent message for range: ${start} - ${end}`);

      await producer.send({
        topic: "influencer-ids",
        messages: [
          {
            value: JSON.stringify({ start: start, end: end }),
          },
        ],
      });
    }
  } catch (error) {
    logger.error("Error occurred while sending message:", error);
  } finally {
    await producer.disconnect();
    logger.info("Producer Disconnected");
  }
}

function init() {
  const now = new Date();
  const nextMinute = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes() + 1,
    0,
    0
  );
  const delay = nextMinute.getTime() - now.getTime();

  const startId = parseInt(process.argv[2], 10);
  const endId = parseInt(process.argv[3], 10);

  if (isNaN(startId) || isNaN(endId) || startId >= endId) {
    logger.error(
      "Invalid start or end ID. Pass numbers at the end of the command."
    );
    return;
  }

  setTimeout(() => {
    sendMessages(startId, endId);
    setInterval(()=> sendMessages(startId,endId), 60000); // Run every minute
  }, delay);

  logger.info(
    "Producer initialized. Will start sending messages every minute."
  );
}

init();
