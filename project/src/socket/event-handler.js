/**
 * @fileoverview Socket Event Handler
 * @description Routes Kafka messages to appropriate Socket.IO rooms
 */

const { getInstance } = require("./socket-server");

/**
 * Handle incoming Kafka message and emit to Socket.IO room
 *
 * Expected message format:
 * {
 *   service: "humans",
 *   event: "person.created",
 *   room: "organization:uuid-xxx",
 *   data: { ... },
 *   timestamp: "2026-02-11T..."
 * }
 *
 * @param {Object} message - Parsed Kafka message
 */
function handleEvent(message) {
  const io = getInstance();

  if (!io) {
    console.warn("[EventHandler] Socket.IO not initialized, dropping event:", message.event);
    return;
  }

  const { event, room, data, service, timestamp } = message;

  if (!event) {
    console.warn("[EventHandler] Missing event name, dropping message");
    return;
  }

  const payload = {
    ...data,
    _service: service,
    _timestamp: timestamp,
  };

  if (room) {
    // Emit to specific room
    io.to(room).emit(event, payload);
    console.log(`[EventHandler] ${service}.${event} -> room: ${room}`);
  } else {
    // No room specified, broadcast to all connected clients
    io.emit(event, payload);
    console.log(`[EventHandler] ${service}.${event} -> broadcast`);
  }
}

module.exports = { handleEvent };
