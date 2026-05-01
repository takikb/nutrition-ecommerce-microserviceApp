import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken';

declare global {
    var signin: () => string[];
}

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "qsdfqsdf"

    mongo = await MongoMemoryServer.create()
    const mongoUri = mongo.getUri()
    
    await mongoose.connect(mongoUri)
})

beforeEach(async () => {
    const collections = await mongoose.connection.db!.collections()

    for(let collection of collections) {
        await collection.deleteMany({})
    }
})

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()

})

global.signin = () => {

    const id = new mongoose.Types.ObjectId().toHexString();
    // Build a JWT payload
    const payload = {
        id,
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'vendor'
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session object { jwt: MY_JWT }
    const session = { jwt: token }

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session)

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    // return a string thats the cookie with the encoded data
    return [`session=${base64}`];
}