import mongoose from "mongoose"
import { app } from './app'

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined')
  }

  try {
    await mongoose.connect('mongodb://products-mongo-srv:27017/products?replicaSet=rs0')
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
  }
}

app.listen(3000, () => {
  console.log('App running on port 3000')
})

start() 
