import express from 'express';

const app = express();
// Add any middleware your routes need to function in tests
app.use(express.json()); 

const io = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    // We don't need .adapter here because the mock isn't a real Socket.io server
};

const httpServer = {}; 

export { app, io, httpServer };