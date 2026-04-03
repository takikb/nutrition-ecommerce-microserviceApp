import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(201)
})

it('return a 400 with an invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'testtest.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(400)
})

it('return a 400 with a short password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'pas',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(400)
})

it('return a 400 when trying to sign up with a duplicate email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(201)
        
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(400)
})

it('return a 400 when missing email or password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(400)

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(400) 
})

it('return a 400 when chosing customer role without providing its required fields', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'customer'
        })
        .expect(400)
})

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
            fullName: 'taki',
            role: 'vendor'
        })
        .expect(201)
        
    expect(response.get('Set-Cookie')).toBeDefined()
    })