import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.id;
      } catch (err) {
        console.log('[Socket Auth] Invalid token provided in handshake');
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id}, User: ${socket.userId || 'Guest'}`);

    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on('join:auction', (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`[Socket] User ${socket.userId || socket.id} joined room auction:${auctionId}`);
    });

    socket.on('leave:auction', (auctionId) => {
      socket.leave(`auction:${auctionId}`);
      console.log(`[Socket] User ${socket.userId || socket.id} left room auction:${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

export const emitToAuction = (auctionId, event, data) => {
  if (io) {
    io.to(`auction:${auctionId}`).emit(event, data);
    // Also emit to all clients on marketplace feed
    io.emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId.toString()}`).emit(event, data);
  }
};

export const emitGlobal = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};
