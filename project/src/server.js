require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");

const { initialize } = require("./socket/socket-server");
const { handleEvent } = require("./socket/event-handler");
const { startConsumer, stopConsumer } = require("./kafka/consumer");

const app = express();
app.use(cors({ origin: "*" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "tiktak-service-socket" });
});


// HTTP Server (Socket.IO icin gerekli)
const server = http.createServer(app);

// Socket.IO initialize
initialize(server);

// Kafka consumer baslat ve event'leri Socket.IO'ya yonlendir
startConsumer(handleEvent).catch((err) => {
  console.error("[Server] Failed to start Kafka consumer:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await stopConsumer();
  server.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, shutting down...");
  await stopConsumer();
  server.close(() => process.exit(0));
});

const PORT = process.env.PORT || 7010;

server.listen(PORT, () => {
  console.log("-------------------------------------------");
  console.log("Tiktak Service Socket");
  console.log(`PORT: ${PORT}`);
  console.log(`Ortam: ${process.env.NODE_ENV}`);
  console.log("Socket.IO: Enabled");
  console.log("Kafka Consumer: Starting...");
  console.log("-------------------------------------------");
});
