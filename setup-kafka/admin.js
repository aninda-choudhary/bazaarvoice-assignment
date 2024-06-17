const { kafka } = require("./client");

const admin = kafka.admin();

async function init() {
  console.log("Admin connecting...");
  admin.connect();
  console.log("Admin Connection Success...");

  console.log("Creating Topic [influencer-ids]");
  await admin.createTopics({
    topics: [
      {
        topic: "influencer-ids",
        numPartitions: 2,
        replicationFactor:1
      },
    ],
  });
  console.log("Topic Created Success [influencer-ids]");

  console.log("Disconnecting Admin..");
  await admin.disconnect();
}

init();