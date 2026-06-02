import mongoose from "mongoose";

interface UserAttrs {
    id: string;
    fullName: string;
    role: string;
}

export interface UserDoc extends mongoose.Document {
    fullName: string;
    role: string;
    version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
    findByEvent(event: { id: string; version: number }): Promise<UserDoc | null>;
}

const userSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

userSchema.set('versionKey', 'version');

userSchema.pre('save', function() {
    if (!this.isNew) {
        this.increment();
    }
});

userSchema.statics.findByEvent = (event: { id: string; version: number }) => {
    return User.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User({
        _id: attrs.id,
        fullName: attrs.fullName,
        role: attrs.role
    });
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
export { User };