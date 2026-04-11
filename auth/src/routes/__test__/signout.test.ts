import request from 'supertest';
import { app } from '../../app';

it('clears the cookie after signing out', async () => {
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

  const response =await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200)

    expect(response.get('Set-Cookie')![0]).toContain('session=;');
})