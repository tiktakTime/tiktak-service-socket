/**
 * @fileoverview Kafka Consumer
 * @description Consumes socket-events topic and forwards to Socket.IO event handler
 */

const { kafka, getTopicName, GROUP_ID } = require("./config");

let consumer = null;

/**
 * Initialize Kafka consumer and ensure topic exists
 *
 * @param {Function} onMessage - Callback for each consumed message
 */
async function startConsumer(onMessage) {
  const topicName = getTopicName();

  // Ensure topic exists
  const admin = kafka.admin();
  await admin.connect();
  const topicList = await admin.listTopics();
  const topicExists = topicList.includes(topicName);

  if (!topicExists) {
    console.log(`[Kafka] Creating topic: ${topicName}`);
    await admin.createTopics({
      topics: [
        {
          topic: topicName,
          numPartitions: 3,
        },
      ],
    });
  }
  await admin.disconnect();

  // Start consumer
  consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  console.log(`[Kafka] Consumer connected, group: ${GROUP_ID}`);

  await consumer.subscribe({ topic: topicName, fromBeginning: false });
  console.log(`[Kafka] Subscribed to topic: ${topicName}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const value = message.value.toString();
        const parsed = JSON.parse(value);

        console.log(
          `[Kafka] Message received: ${parsed.service}.${parsed.event} -> room: ${parsed.room}`
        );

        onMessage(parsed);
      } catch (err) {
        console.error("[Kafka] Error processing message:", err);
      }
    },
  });
}

/**
 * Gracefully disconnect consumer
 */
async function stopConsumer() {
  if (consumer) {
    console.log("[Kafka] Disconnecting consumer...");
    await consumer.disconnect();
    consumer = null;
  }
}

module.exports = { startConsumer, stopConsumer };
