import mongoose from "mongoose";
import { Password } from "../services/password"

export enum PrimaryHealthGoals {
    WEIGHT_LOSS = 'weight_loss',
    MUSCLE_GAIN = 'muscle_gain',
    MAINTENANCE = 'maintenance',
    OTHER = 'other'
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY_ACTIVE = 'lightly_active',
    MODERATELY_ACTIVE = 'moderately_active',
    VERY_ACTIVE = 'very_active'
}


export enum Gender { MALE = 'male', FEMALE = 'female' }

interface HealthProfileAttrs {
    userId: string
    gender: Gender
    dateOfBirth: Date
    heightCM: number
    weightKG: number
    primaryHealthGoal: PrimaryHealthGoals
    medicalConditions?: string[]
    allergies?: string[]
    activityLevel: ActivityLevel
}

interface HealthProfileModel extends mongoose.Model<HealthProfileDoc> {
    build(attrs: HealthProfileAttrs): HealthProfileDoc;
}


interface HealthProfileDoc extends mongoose.Document {
    userId: string
    gender: Gender
    dateOfBirth: Date
    heightCM: number
    weightKG: number
    calculatedBMI: number
    calculatedBMR: number
    primaryHealthGoal: PrimaryHealthGoals
    medicalConditions?: string[]
    allergies?: string[]
    activityLevel: ActivityLevel
    createdAt: Date
    updatedAt: Date
}

const healthProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    heightCM: {
        type: Number,
        required: true
    },
    weightKG: {
        type: Number,
        required: true
    },
    calculatedBMI: {
        type: Number
    },
    calculatedBMR: {
        type: Number
    },
    primaryHealthGoal: {
        type: String,
        enum: Object.values(PrimaryHealthGoals),
        required: true
    },
    medicalConditions: {
        type: [String],
        default: []
    },
    allergies: {
        type: [String],
        default: []
    },
    activityLevel: {
        type: String,
        enum: Object.values(ActivityLevel),
        required: true
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
});

healthProfileSchema.pre('save', function () {
    if (this.isModified('heightCM') || this.isModified('weightKG') || this.isModified('dateOfBirth')) {
        // Calculate BMI
        const heightM = this.get('heightCM') / 100;
        this.set('calculatedBMI', parseFloat((this.get('weightKG') / (heightM * heightM)).toFixed(2)));

        // Calculate BMR using Mifflin-St Jeor Equation
        const age = Math.floor((Date.now() - this.get('dateOfBirth').getTime()) / (1000 * 60 * 60 * 24 * 365.25));

        let bmr = (10 * this.get('weightKG')) + (6.25 * this.get('heightCM')) - (5 * age);
        bmr = this.get('gender') === Gender.MALE ? bmr + 5 : bmr - 161;

        this.set('calculatedBMR', Math.round(bmr));
    }
})

healthProfileSchema.statics.build = (attrs: HealthProfileAttrs) => {
    return new HealthProfile(attrs);
}

const HealthProfile = mongoose.model<HealthProfileDoc, HealthProfileModel>('HealthProfile', healthProfileSchema);

export { HealthProfile }