import mongoose from "mongoose"
import { Password } from "../services/password"
import crypto from 'crypto'

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
    version: number

    passwordResetToken?: string
    passwordResetExpires?: Date
    // define the custom instance method
    createPasswordResetToken(): string
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
        },
        passwordResetToken: {
            type: String
        },
        passwordResetExpires: {
            type: Date
        }

    }, {
        
        timestamps: true, 
        optimisticConcurrency: true,
        toJSON: {
            transform(doc, ret: any) {
                ret.id = ret._id
                delete ret._id
                delete ret.password
                delete ret.__v
                delete ret.passwordResetToken  
                delete ret.passwordResetExpires
            }
        }
    }
)

userSchema.set('versionKey', 'version');

userSchema.pre('save', function() {
    if (!this.isNew) {
        // only increment the version if fullName or email is modified
        if (this.isModified('fullName') || this.isModified('email')) {
            this.increment();
        }
    }
});

// Custom instance helper method to generate secure tokens
userSchema.methods.createPasswordResetToken = function() {
    // 1. Generate a raw, unhashed 32-byte hexadecimal token
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash the token using SHA-256 to save securely in MongoDB
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(rawResetToken)
        .digest('hex');

    // 3. Set token expiry limit to exactly 10 minutes from now
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Return the raw token (this will be sent via email to the user)
    return rawResetToken;
};

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