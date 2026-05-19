import mongoose from "mongoose";
import { httpServer, io } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined')
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }
    
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }

    //connect to a redis pod in the same Kubernetes cluster
    const pubClient = createClient({ url: 'redis://redis-master:6379' });
    const subClient = pubClient.duplicate();
    
    Promise.all([pubClient.connect(), subClient.connect()])

        try {
            io.adapter(createAdapter(pubClient, subClient));
            console.log('Connected to Redis and Socket.IO adapter set up');
        } catch (error) {
            console.error('Error connecting to Redis:', error);
        }

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        )

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

httpServer.listen(3000, () => {
    console.log('App running on port 3000')
})

start()