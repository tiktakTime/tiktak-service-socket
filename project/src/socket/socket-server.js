/**
 * @fileoverview Socket.IO Server
 * @description Manages Socket.IO server instance and room management
 */

const { Server } = require("socket.io");

let io = null;

/**
 * Initialize Socket.IO server
 *
 * @param {import('http').Server} httpServer - HTTP server instance
 * @returns {import('socket.io').Server} Socket.IO server instance
 */
function initialize(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User room join
    socket.on("join:user", (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket] ${socket.id} joined user:${userId}`);
      }
    });

    // Organization room join
    socket.on("join:organization", (organizationId) => {
      if (organizationId) {
        socket.join(`organization:${organizationId}`);
        console.log(
          `[Socket] ${socket.id} joined organization:${organizationId}`
        );
      }
    });

    // Legacy join event support (frontend uyumlulugu)
    socket.on("join", (room) => {
      if (room) {
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room: ${room}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Get Socket.IO server instance
 *
 * @returns {import('socket.io').Server|null}
 */
function getInstance() {
  return io;
}

module.exports = { initialize, getInstance };
