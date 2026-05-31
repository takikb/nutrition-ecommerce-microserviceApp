import mongoose from "mongoose"
import { app } from './app'
import { natsWrapper } from "./nats-wrapper"
import { User } from "./models/user"
import { UserRole } from "@d-ziet/common-lib"

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@nutrition.dev';
        
        // 1 Check if the admin already exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            // 2. Build the admin
            const admin = User.build({
                email: adminEmail,
                password: 'admin123', 
                fullName: 'System Administrator',
                role: UserRole.ADMIN // 'admin'
            });

            await admin.save();
            console.log('Admin user automatically seeded: admin@nutrition.dev');
        }
    } catch (err) {
        console.error('Failed to seed admin user', err);
    }
};

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

    await seedAdmin() // Seed the admin user
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

app.listen(3000, () => {
  console.log('App running on port 3000')
})

start() 