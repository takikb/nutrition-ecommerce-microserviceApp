import mongoose from "mongoose"
import { Password } from "../services/password"


export enum UserRole {
    ADMIN = 'admin',
    CUSTOMER = 'customer',
    VENDOR = 'vendor'
}


// An interface that describes the properties 
// that are required to create a new User 
interface UserAttrs {
    email: string
    password: string
    fullName: string
    role: UserRole
}

// An interface that describes the properties 
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

 
// An interface that describes the properties 
// that a Users Document has 
interface UserDoc extends mongoose.Document {
    email: string
    password: string
    fullName: string
    role: UserRole
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }

    }, {
        
        timestamps: true, 

        toJSON: {
            transform(doc, ret: any) {
                ret.id = ret._id
                delete ret._id
                delete ret.password
                delete ret.__v
            }
        }
    }
)

// any time we try to save a user, this function will run first
userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'))
        this.set('password', hashed)
    } 
})

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }