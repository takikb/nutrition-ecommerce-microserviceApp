import { MongoMemoryReplSet, MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from "../app"
import request from 'supertest';

declare global {
    var getAuthCookie: () => Promise<string[]>;
}

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "qsdfqsdf"

    mongo = await MongoMemoryReplSet.create()
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

global.getAuthCookie = async () => {
    const email = 'test@test.com';
    const password = 'password';
    const fullName = 'Test User';
    const role = 'vendor';
    const vendorData = {
        displayName: 'Test Vendor',
        phoneNumber: '1234567890',
        location: {
            address: '123 Test St',
            wilaya: 'Testville'
        }
    };

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password, fullName, role, vendorData
        })
        .expect(201)

    const cookie = response.get('Set-Cookie');
    return cookie!;
}