import express from 'express'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@d-ziet/common-lib'

import { createServer } from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { Promise } from 'mongoose'

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

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for testing; adjust in production
        methods: ['GET', 'POST']
    }
});

//connect to a redis pod in the same Kubernetes cluster
const pubClient = createClient({ url: 'redis://redis-master:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('Connected to Redis and Socket.IO adapter set up');
    })

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

export { app, io, httpServer }