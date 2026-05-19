import express from 'express'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser, NotAuthorizedError } from '@d-ziet/common-lib'
import jwt from 'jsonwebtoken'

import { createServer } from 'http'
import { Server } from 'socket.io'

import { newConversationRouter } from './routes/new-conversation';
import { indexConversationsRouter } from './routes/index-conversations';
import { showMessagesRouter } from './routes/show-messages';
import { newMessageRouter } from './routes/new-message';
import { readMessagesRouter } from './routes/read-messages';
import { unreadCountRouter } from './routes/unread-count';


const app = express()
app.set('trust proxy', true) // trust traffic from ingress-nginx
app.use(json())
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test' // only use secure cookies in production and development
    })
)

app.use(currentUser)

app.use(newConversationRouter);
app.use(indexConversationsRouter);
app.use(showMessagesRouter);
app.use(newMessageRouter);
app.use(readMessagesRouter);
app.use(unreadCountRouter);

app.all(/(.*)/, async() => {
    throw new NotFoundError();
})

app.use(errorHandler)


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for testing; adjust in production
        methods: ['GET', 'POST']
    }
});


io.use((socket, next) => {
    const token = socket.handshake.auth.token; // frontend must send this token when connecting

    try {
        const payload = jwt.verify(token, process.env.JWT_KEY!) as any;
        socket.data.userId = payload.id;
        next();
    } catch (error) {
        next(new NotAuthorizedError());
    }
});

//socket.io connection handler
io.on('connection', (socket: any) => {
    console.log('User connected:', socket.id);

    // user joins a room specific to their userId
    socket.on('joinRoom', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    })
});

export { app, io, httpServer }