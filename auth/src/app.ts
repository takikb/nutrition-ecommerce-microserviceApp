import express from 'express'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'
import { updateUserRouter } from './routes/update'
import { showProfileRouter } from './routes/profile'
import { errorHandler, NotFoundError, currentUser } from '@d-ziet/common-lib'


const app = express()
app.set('trust proxy', true) // trust traffic from ingress-nginx
app.use(json())
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test' // only use secure cookies in production and development
}))

app.use(currentUser)

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)
app.use(updateUserRouter)
app.use(showProfileRouter)

app.all(/(.*)/, async() => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }