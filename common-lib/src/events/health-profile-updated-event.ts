import { Subjects } from './subjects';
import { PrimaryHealthGoals, ActivityLevel, MedicalCondition, Allergy, Gender } from './types/health-profile';

export interface HealthProfileUpdatedEvent {
    subject: Subjects.HealthProfileUpdated;
    data: {
        id: string; 
        userId: string;
        version: number;
        gender: Gender;
        dateOfBirth: Date;
        heightCM: number;
        weightKG: number;
        calculatedBMI: number;
        calculatedBMR: number;
        calculatedTDEE: number;
        activityLevel: ActivityLevel;
        medicalCondition: MedicalCondition[];
        allergy: Allergy[];
        primaryHealthGoal: PrimaryHealthGoals;
        createdAt?: Date;
        updatedAt?: Date;
    };
}