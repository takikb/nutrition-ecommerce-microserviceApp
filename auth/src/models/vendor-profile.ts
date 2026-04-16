import mongoose from "mongoose";

interface VendorProfileAttrs {
    userId: string
    displayName: string
    bio?: string
    phoneNumber: string
    location: {
        address: string
        wilaya: string
    }
}

interface vendorProfileModel extends mongoose.Model<VendorProfileDoc> {
    build(attrs: VendorProfileAttrs): VendorProfileDoc;
}

interface VendorProfileDoc extends mongoose.Document {
    userId: string
    displayName: string
    bio?: string
    phoneNumber: string
    location: {
        address: string
        wilaya: string
    }
    rating: number
    totalsales: number
    isSuspended: boolean
    createdAt: Date
    updatedAt: Date
}

const vendorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    bio: {
        type: String,
        maxlength: 500
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    location: {
        address: {
            type: String,
            required: true
        },
        wilaya: {
            type: String,
            required: true
        }
    },
    rating: {
        type: Number,
        default: 0
    },
    totalsales: {
        type: Number,
        default: 0
    },
    isSuspended: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true,

    toJSON: {
        transform(doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
})

vendorProfileSchema.statics.build = (attrs: VendorProfileAttrs) => {
    return new VendorProfile(attrs);
}

const VendorProfile = mongoose.model<VendorProfileDoc, vendorProfileModel>('VendorProfile', vendorProfileSchema)

export { VendorProfile }