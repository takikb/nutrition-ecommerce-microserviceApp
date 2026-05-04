import mongoose from "mongoose"
import { app } from './app'
import { natsWrapper } from "./nats-wrapper"

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }

  try {
    await natsWrapper.connect('nutrition', 'azerty', 'http://nats-srv:4222')

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

app.listen(3000, () => {
  console.log('App running on port 3000')
})

start() 
