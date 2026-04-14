import mongoose from "mongoose";

export enum PrimaryHealthGoals {
    WEIGHT_LOSS = 'weight_loss',
    MUSCLE_GAIN = 'muscle_gain',
    MAINTENANCE = 'maintenance',
    IMPROVED_ENERGY = 'improved_energy',
    OTHER = 'other'
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary',
    LIGHTLY_ACTIVE = 'lightly_active',
    MODERATELY_ACTIVE = 'moderately_active',
    ACTIVE = 'active',
    VERY_ACTIVE = 'very_active'
}

export enum MedicalCondition {
    DIABETES_TYPE_1 = 'diabetes_type_1',
    DIABETES_TYPE_2 = 'diabetes_type_2',
    HYPERTENSION = 'hypertension',
    HIGH_CHOLESTEROL = 'high_cholesterol',
    CELIAC_DISEASE = 'celiac_disease',
    IBS = 'ibs',
    ANEMIA = 'anemia',
    THYROID_DISORDER = 'thyroid_disorder',
    PCOS = 'pcos',
    NONE = 'none',
    OTHER = 'other'
}

export enum Allergy {
    LACTOSE = 'lactose',
    GLUTEN = 'gluten',
    PEANUTS = 'peanuts',
    TREE_NUTS = 'tree_nuts',
    EGGS = 'eggs',
    FISH = 'fish',
    SHELLFISH = 'shellfish',
    STRAWBERRY = 'strawberry',
    NONE = 'none',
    OTHER = 'other'
}

export enum Gender { MALE = 'male', FEMALE = 'female' }

interface HealthProfileAttrs {
    userId: string;
    gender: Gender;
    dateOfBirth: Date;
    heightCM: number;
    weightKG: number;
    activityLevel: ActivityLevel;
    medicalCondition: string[];
    allergy: string[];
    primaryHealthGoal: PrimaryHealthGoals;
}

interface HealthProfileModel extends mongoose.Model<HealthProfileDoc> {
    build(attrs: HealthProfileAttrs): HealthProfileDoc;
}

interface HealthProfileDoc extends mongoose.Document {
    userId: string;
    gender: Gender;
    dateOfBirth: Date;
    heightCM: number;
    weightKG: number;
    calculatedBMI: number;
    calculatedBMR: number;
    calculatedTDEE: number;
    activityLevel: ActivityLevel;
    medicalCondition: string[];
    allergy: string[];
    primaryHealthGoal: PrimaryHealthGoals;
    createdAt: Date;
    updatedAt: Date;
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
    calculatedTDEE: { 
      type: Number 
    },
    primaryHealthGoal: { 
      type: String, 
      enum: Object.values(PrimaryHealthGoals), 
      required: true 
    },
    medicalCondition: { 
      type: [String], 
      enum: Object.values(MedicalCondition), 
      default:[MedicalCondition.NONE] 
    },
    allergy: { 
      type: [String], 
      enum: Object.values(Allergy), 
      default: [Allergy.NONE] 
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
    if (this.isModified('heightCM') || this.isModified('weightKG') || this.isModified('dateOfBirth') || this.isModified('activityLevel')) {
        const weight = this.get('weightKG');
        const height = this.get('heightCM');
        const dateOfBirth = this.get('dateOfBirth');

        const heightM = height / 100;
        this.set('calculatedBMI', parseFloat((weight / (heightM * heightM)).toFixed(2)));

        const age = Math.floor((Date.now() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr = this.get('gender') === Gender.MALE ? bmr + 5 : bmr - 161;
        this.set('calculatedBMR', Math.round(bmr));

        const multipliers: Record<ActivityLevel, number> = {
            [ActivityLevel.SEDENTARY]: 1.2,
            [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
            [ActivityLevel.MODERATELY_ACTIVE]: 1.55,[ActivityLevel.ACTIVE]: 1.65,
            [ActivityLevel.VERY_ACTIVE]: 1.725
        };
        const tdee = bmr * multipliers[this.get('activityLevel')];
        this.set('calculatedTDEE', Math.round(tdee));
    }
});

healthProfileSchema.statics.build = (attrs: HealthProfileAttrs) => {
    return new HealthProfile(attrs);
};

const HealthProfile = mongoose.model<HealthProfileDoc, HealthProfileModel>('HealthProfile', healthProfileSchema);

export { HealthProfile };