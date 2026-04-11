import request from 'supertest';
import { app } from '../../app';

it('returns a 200 on successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor',
            vendorData: {
                displayName: 'taki',
                phoneNumber: '1234567890',
                location: {
                    address: '123 Ali Mendjeli',
                    city: 'Constantine'
                }
            }
        })
        .expect(201)
    
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
            role: 'vendor'
        })
        .expect(200)

})

it('returns a 400 with an invalid email', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'invalid@test.com',
            password: 'password',
            role: 'vendor'
        })
        .expect(400)
})

it('returns a 400 with wrong password or role', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor',
            vendorData: {
                displayName: 'taki',
                phoneNumber: '1234567890',
                location: {
                    address: '123 Ali Mendjeli',
                    city: 'Constantine'
                }
            }
        })
        .expect(201)

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'wrongpassword',
            role: 'vendor'
        })
        .expect(400)
    
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
            role: 'customer'
        })
        .expect(400)
})

it('sets a cookie after successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor',
            vendorData: {
                displayName: 'taki',
                phoneNumber: '1234567890',
                location: {
                    address: '123 Ali Mendjeli',
                    city: 'Constantine'
                }
            }

        })
        .expect(201)
    
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
            role: 'vendor'
        })
        .expect(200)
        
    expect(response.get('Set-Cookie')).toBeDefined();
})