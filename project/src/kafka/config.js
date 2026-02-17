/**
 * @fileoverview Kafka Configuration
 * @description Kafka connection settings for socket-events topic
 */

const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "tiktak-socket-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["10.0.0.4:9092"],
});

const getTopicName = () => {
  return process.env.NODE_ENV === "dev"
    ? "socket-events-test"
    : "socket-events-live";
};

const GROUP_ID = "socket-service-consumer";

module.exports = { kafka, getTopicName, GROUP_ID };
