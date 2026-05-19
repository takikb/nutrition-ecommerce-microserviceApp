import express from 'express'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, requireAuth, currentUser } from '@d-ziet/common-lib'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'
import { indexOrderRouter } from './routes/index'
import { deleteOrderRouter } from './routes/delete'
import { completeOrderRouter } from './routes/complete'

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

app.use(newOrderRouter)
app.use(showOrderRouter)
app.use(indexOrderRouter)
app.use(deleteOrderRouter)
app.use(completeOrderRouter)

app.all(/(.*)/, async() => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }