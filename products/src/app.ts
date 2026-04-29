import express from 'express'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, requireAuth, currentUser } from '@d-ziet/common-lib'
import { newProductRouter } from './routes/new'

const app = express()
app.set('trust proxy', true) // trust traffic from ingress-nginx
app.use(json())
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test' // only use secure cookies in production and development
    })
)

app.use(currentUser)
app.use(newProductRouter)

app.all(/(.*)/, async() => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }