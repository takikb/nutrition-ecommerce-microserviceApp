import { useState, useEffect } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import axios from "axios";
import useRequest from "../../hooks/use-request";

// Predefined configurations matching the Signup flow specifications
const MEDICAL_CONDITIONS = [
    { value: 'diabetes_type_1', label: 'Diabetes Type 1' },
    { value: 'diabetes_type_2', label: 'Diabetes Type 2' },
    { value: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
    { value: 'high_cholesterol', label: 'High Cholesterol' },
    { value: 'celiac_disease', label: 'Celiac Disease' },
    { value: 'ibs', label: 'IBS (Irritable Bowel Syndrome)' },
    { value: 'anemia', label: 'Anemia' },
    { value: 'thyroid_disorder', label: 'Thyroid Disorder' },
    { value: 'pcos', label: 'PCOS (Polycystic Ovary Syndrome)' },
    { value: 'none', label: 'None' }
];

const ALLERGIES = [
    { value: 'lactose', label: 'Lactose Intolerance' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'none', label: 'None' }
];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary (Little or no exercise)' },
    { value: 'lightly_active', label: 'Lightly Active (1-3 days/week)' },
    { value: 'moderately_active', label: 'Moderately Active (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (Intense exercise)' }
];

const HEALTH_GOALS = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'improved_energy', label: 'Improved Energy' },
    { value: 'other', label: 'Other' }
];

// =========================================================================
// 🥦 VIEW A: VENDOR PROFILE SETTINGS
// =========================================================================
const VendorProfileView = ({ profileData, currentUser }) => {
    const initialUser = profileData?.user || {};
    const initialProfile = profileData?.profile || {};

    // Input States
    const [fullName, setFullName] = useState(initialUser.fullName || "");
    const [displayName, setDisplayName] = useState(initialProfile.displayName || "");
    const [bio, setBio] = useState(initialProfile.bio || "");
    const [phoneNumber, setPhoneNumber] = useState(initialProfile.phoneNumber || "");
    const [address, setAddress] = useState(initialProfile.location?.address || "");
    const [wilaya, setWilaya] = useState(initialProfile.location?.wilaya || "");

    const [toastMessage, setToastMessage] = useState("");

    // Original data tracking for change-detection
    const [originalData, setOriginalData] = useState({
        fullName: initialUser.fullName || "",
        displayName: initialProfile.displayName || "",
        bio: initialProfile.bio || "",
        phoneNumber: initialProfile.phoneNumber || "",
        address: initialProfile.location?.address || "",
        wilaya: initialProfile.location?.wilaya || ""
    });

    const hasUnsavedChanges = 
        fullName !== originalData.fullName ||
        displayName !== originalData.displayName ||
        bio !== originalData.bio ||
        phoneNumber !== originalData.phoneNumber ||
        address !== originalData.address ||
        wilaya !== originalData.wilaya;

    // Direct profile save handshake hook [4]
    const { doRequest, errors } = useRequest({
        url: "/api/users/update",
        method: "put",
        body: {
            fullName,
            vendorData: {
                displayName,
                bio,
                phoneNumber,
                location: {
                    address,
                    wilaya
                }
            }
        },
        onSuccess: () => {
            setOriginalData({
                fullName,
                displayName,
                bio,
                phoneNumber,
                address,
                wilaya
            });
            setToastMessage("Vendor profile settings saved!");
            setTimeout(() => setToastMessage(""), 3000);
        }
    });

    const handleDiscard = () => {
        setFullName(originalData.fullName);
        setDisplayName(originalData.displayName);
        setBio(originalData.bio);
        setPhoneNumber(originalData.phoneNumber);
        setAddress(originalData.address);
        setWilaya(originalData.wilaya);
    };

    const initials = getInitials(displayName || fullName);
    function getInitials(name) {
        if (!name) return "GO";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    }

    return (
        <div className="bg-orange-50/50 text-zinc-800 min-h-screen pb-32">
            
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 animate-enter text-sm font-medium">
                    <span className="material-symbols-outlined text-lime-400">check_circle</span>
                    {toastMessage}
                </div>
            )}

            <main className="flex-grow w-full max-w-4xl mx-auto px-md py-xl pb-[120px] animate-enter">
                
                {/* Hero Banner & Avatar overlapping */}
                <div className="relative mb-xl select-none">
                    <div className="h-32 w-full rounded-xl bg-primary-fixed overflow-hidden relative">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #3f6a00 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
                    </div>
                    
                    <div className="absolute -bottom-10 left-md flex items-end">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-surface bg-primary-container text-white flex items-center justify-center shadow-sm z-10 text-headline-xl font-headline-xl">
                                {initials}
                            </div>
                        </div>
                        <div className="ml-sm mb-xs">
                            <h1 className="font-headline-md text-headline-md text-zinc-800">Settings</h1>
                            <p className="font-body-md text-body-md text-zinc-500">Manage your store identity and operational details.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-lg mt-16">
                    {/* Public Profile Card */}
                    <section className="p-md md:p-lg border flex flex-col gap-md bg-white rounded-3xl border-zinc-100 shadow-sm">
                        <div className="border-b border-outline-variant/50 pb-sm mb-sm flex justify-between items-center">
                            <div>
                                <h2 className="font-headline-md text-headline-md text-zinc-800">Public Profile</h2>
                                <p className="font-body-md text-body-md text-zinc-500 mt-xs">This information will be displayed publicly on your vendor page.</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <label className="text-xs text-zinc-400 font-bold select-none">Account Name</label>
                                <input 
                                    className="text-right font-semibold text-zinc-700 bg-transparent border-0 border-b border-dashed border-zinc-300 hover:border-lime-600 focus:border-lime-600 focus:ring-0 outline-none p-0 w-48 transition-all"
                                    type="text" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-md">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-zinc-500" htmlFor="storeName">Store Display Name</label>
                                <input 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-[10px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md transition-all shadow-sm" 
                                    id="storeName" 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-zinc-500" htmlFor="storeBio">Store Bio <span className="text-zinc-400 font-normal">(Optional)</span></label>
                                <textarea 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-[10px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md transition-all shadow-sm resize-none" 
                                    id="storeBio" 
                                    placeholder="Tell customers about your organic practices and mission..." 
                                    rows="4"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                                <p className="font-label-sm text-label-sm text-zinc-400 text-right mt-1">{bio.length} / 500</p>
                            </div>
                        </div>
                    </section>

                    {/* Business Details Card */}
                    <section className="p-md md:p-lg border flex flex-col gap-md bg-white rounded-3xl border-zinc-100 shadow-sm">
                        <div className="border-b border-outline-variant/50 pb-sm mb-sm">
                            <h2 className="font-headline-md text-headline-md text-zinc-800">Business Details</h2>
                            <p className="font-body-md text-body-md text-zinc-500 mt-xs">Private information used for operations and communication.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md md:gap-lg">
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-zinc-500" htmlFor="businessPhone">Business Phone</label>
                                <div className="relative">
                                    <span className="absolute left-sm top-1/2 -translate-y-1/2 text-zinc-400 material-symbols-outlined text-[18px]">call</span>
                                    <input 
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-[10px] pl-lg pr-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md transition-all shadow-sm" 
                                        id="businessPhone" 
                                        placeholder="+213 555 000 000" 
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-zinc-500 flex items-center gap-xs" htmlFor="accountEmail">
                                    Account Email 
                                    <span className="material-symbols-outlined text-[14px] text-outline cursor-help select-none" title="Account emails are locked for security verification.">info</span>
                                </label>
                                <input 
                                    className="w-full bg-surface-container-low border border-outline-variant/50 text-zinc-400 rounded-lg px-sm py-[10px] focus:outline-none text-body-md font-body-md shadow-sm cursor-not-allowed select-none" 
                                    id="accountEmail" 
                                    readOnly 
                                    type="email" 
                                    value={currentUser.email}
                                />
                            </div>
                            <div className="flex flex-col gap-xs md:col-span-2">
                                <label className="font-label-md text-label-md text-zinc-500" htmlFor="streetAddress">Street Address</label>
                                <input 
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-[10px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md transition-all shadow-sm" 
                                    id="streetAddress" 
                                    placeholder="e.g. 15 Rue Didouche Mourad" 
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-xs">
                                <label className="font-label-md text-label-md text-zinc-500" htmlFor="wilayaSelect">Wilaya</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm py-[10px] appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md font-body-md transition-all pr-10 shadow-sm" 
                                        id="wilayaSelect"
                                        value={wilaya}
                                        onChange={(e) => setWilaya(e.target.value)}
                                    >
                                        <option disabled value="">Select a Wilaya</option>
                                        <option value="16">16 - Alger</option>
                                        <option value="31">31 - Oran</option>
                                        <option value="25">25 - Constantine</option>
                                        <option value="09">09 - Blida</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Server validation errors */}
            {errors && (
                <div className="max-w-4xl mx-auto px-md py-2">
                    {errors}
                </div>
            )}

            {/* Floating Save Banner (Smooth slide-in triggered by un-saved state changes) */}
            <div className={`fixed bottom-md left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-3xl bg-white border border-outline-variant rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 p-sm md:px-lg md:py-sm flex flex-col md:flex-row justify-between items-center gap-sm transform transition-transform duration-300 ${
                hasUnsavedChanges ? "translate-y-0" : "translate-y-[150%]"
            }`} id="saveBanner">
                <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container select-none">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                    </div>
                    <span className="font-body-md text-body-md text-zinc-800 font-medium">You have unsaved changes</span>
                </div>
                <div className="flex items-center gap-sm w-full md:w-auto">
                    <button 
                        onClick={handleDiscard}
                        className="flex-1 md:flex-none px-md py-sm rounded-lg font-label-md text-label-md border border-outline-variant text-zinc-800 hover:bg-surface-container-high transition-colors focus:outline-none"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={() => doRequest()}
                        className="flex-1 md:flex-none px-md py-sm rounded-lg font-label-md text-label-md bg-lime-600 text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all transform active:scale-95 focus:outline-none"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 🥗 VIEW B: CUSTOMER PROFILE WORKSPACE
// =========================================================================
const CustomerProfileView = ({ profileData }) => {
    const initialUser = profileData?.user || {};
    const initialProfile = profileData?.profile || {};

    const [currentProfile, setCurrentProfile] = useState(initialProfile);

    // Input States
    const [fullName, setFullName] = useState(initialUser.fullName || "");
    const [weight, setWeight] = useState(initialProfile.weightKG || 70);
    const [height, setHeight] = useState(initialProfile.heightCM || 170);
    const [gender, setGender] = useState(initialProfile.gender || "male");
    const [dateOfBirth, setDateOfBirth] = useState(
        initialProfile.dateOfBirth ? initialProfile.dateOfBirth.substring(0, 10) : "1998-05-14"
    );
    const [activityLevel, setActivityLevel] = useState(initialProfile.activityLevel || "moderately_active");
    const [primaryHealthGoal, setPrimaryHealthGoal] = useState(initialProfile.primaryHealthGoal || "maintenance");
    const [medicalConditions, setMedicalConditions] = useState(initialProfile.medicalCondition || []);
    const [allergies, setAllergies] = useState(initialProfile.allergy || []);

    const [showConditionInput, setShowConditionInput] = useState(false);
    const [showAllergyInput, setShowAllergyInput] = useState(false);

    const [toastMessage, setToastMessage] = useState("");

    const [originalData, setOriginalData] = useState({
        fullName: initialUser.fullName || "",
        weight: initialProfile.weightKG || 70,
        height: initialProfile.heightCM || 170,
        gender: initialProfile.gender || "male",
        dateOfBirth: initialProfile.dateOfBirth ? initialProfile.dateOfBirth.substring(0, 10) : "1998-05-14",
        activityLevel: initialProfile.activityLevel || "moderately_active",
        primaryHealthGoal: initialProfile.primaryHealthGoal || "maintenance",
        medicalConditions: initialProfile.medicalCondition || [],
        allergies: initialProfile.allergy || []
    });

    const hasUnsavedChanges = 
        fullName !== originalData.fullName ||
        Number(weight) !== Number(originalData.weight) ||
        Number(height) !== Number(originalData.height) ||
        gender !== originalData.gender ||
        dateOfBirth !== originalData.dateOfBirth ||
        activityLevel !== originalData.activityLevel ||
        primaryHealthGoal !== originalData.primaryHealthGoal ||
        JSON.stringify(medicalConditions) !== JSON.stringify(originalData.medicalConditions) ||
        JSON.stringify(allergies) !== JSON.stringify(originalData.allergies);

    const displayBMI = currentProfile.calculatedBMI ? Number(currentProfile.calculatedBMI).toFixed(1) : "N/A";
    const displayBMR = currentProfile.calculatedBMR ? Math.round(currentProfile.calculatedBMR) : 0;
    const displayTDEE = currentProfile.calculatedTDEE ? Math.round(currentProfile.calculatedTDEE) : 0;

    const getBMICategory = (bmiVal) => {
        if (bmiVal === "N/A" || isNaN(bmiVal)) return "No Data";
        const bmi = Number(bmiVal);
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Normal Weight";
        if (bmi < 30) return "Overweight";
        return "Obese";
    };

    const { doRequest, errors } = useRequest({
        url: "/api/users/update",
        method: "put",
        body: {
            fullName,
            healthData: {
                gender,
                dateOfBirth,
                heightCM: Number(height),
                weightKG: Number(weight),
                activityLevel,
                primaryHealthGoal,
                medicalCondition: medicalConditions,
                allergy: allergies
            }
        },
        onSuccess: (data) => {
            setCurrentProfile(data.profile);
            setOriginalData({
                fullName,
                weight: Number(weight),
                height: Number(height),
                gender,
                dateOfBirth,
                activityLevel,
                primaryHealthGoal,
                medicalConditions: [...medicalConditions],
                allergies: [...allergies]
            });
            setToastMessage("Health profile updated successfully!");
            setTimeout(() => setToastMessage(""), 3000);
        }
    });

    const handleDiscard = () => {
        setFullName(originalData.fullName);
        setWeight(originalData.weight);
        setHeight(originalData.height);
        setGender(originalData.gender);
        setDateOfBirth(originalData.dateOfBirth);
        setActivityLevel(originalData.activityLevel);
        setPrimaryHealthGoal(originalData.primaryHealthGoal);
        setMedicalConditions([...originalData.medicalConditions]);
        setAllergies([...originalData.allergies]);
    };

    const handleRemoveCondition = (index) => {
        setMedicalConditions(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveAllergy = (index) => {
        setAllergies(prev => prev.filter((_, i) => i !== index));
    };

    const initials = getInitials(fullName);
    function getInitials(name) {
        if (!name) return "A";
        return name.split(" ").map(n => n[0]).join("").substring(0, 1).toUpperCase();
    }

    return (
        <div className="bg-orange-50/50 text-zinc-800 min-h-screen pb-32">
            
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 animate-enter text-sm font-medium">
                    <span className="material-symbols-outlined text-lime-400">check_circle</span>
                    {toastMessage}
                </div>
            )}

            <main className="max-w-container-max mx-auto px-gutter py-lg space-y-xl animate-enter">
                {/* Profile Header */}
                <section className="flex flex-col md:flex-row items-center md:items-start gap-md text-center md:text-left">
                    <div className="w-24 h-24 rounded-full bg-lime-600 flex items-center justify-center text-white font-headline-xl text-headline-xl shadow-sm select-none">
                        {initials}
                    </div>
                    <div className="flex-1 space-y-xs">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <input 
                                className="font-headline-lg text-headline-lg text-zinc-800 bg-transparent border-0 border-b border-dashed border-zinc-300 hover:border-lime-600 focus:border-lime-600 focus:ring-0 outline-none p-0 w-full max-w-sm transition-all"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                            <span className="text-zinc-400 text-sm hidden md:inline select-none">✏️ (Click to rename)</span>
                        </div>
                        <p className="font-body-lg text-body-lg text-zinc-500 max-w-2xl">
                            Manage your metabolic data and personal preferences to ensure GhidhAI delivers the most accurate, human-centric nutrition recommendations tailored just for you.
                        </p>
                    </div>
                </section>

                {/* Metabolic Vitals */}
                <section>
                    <h2 className="font-headline-md text-headline-md text-zinc-800 mb-md">Metabolic Vitals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                        {/* BMI Card */}
                        <div className="bg-white rounded-3xl p-md border border-zinc-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-lg">
                                <div className="p-2 rounded-xl bg-zinc-100 text-zinc-500">
                                    <span className="material-symbols-outlined">directions_run</span>
                                </div>
                                <span className="bg-lime-600 text-white font-label-sm text-label-sm px-3 py-1 rounded-full select-none">
                                    {getBMICategory(displayBMI)}
                                </span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-zinc-500 mb-xs">Current BMI</p>
                                <p className="font-headline-lg text-headline-lg text-lime-600">{displayBMI}</p>
                            </div>
                        </div>
                        {/* BMR Card */}
                        <div className="bg-white rounded-3xl p-md border border-zinc-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-lg">
                                <div className="p-2 rounded-xl bg-zinc-100 text-zinc-500">
                                    <span className="material-symbols-outlined">local_fire_department</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-zinc-500 mb-xs">Basal Metabolic Rate</p>
                                <p className="font-headline-lg text-headline-lg text-zinc-800">
                                    {displayBMR.toLocaleString()} <span className="font-body-md text-body-md text-zinc-500">kcal</span>
                                </p>
                            </div>
                        </div>
                        {/* TDEE Card */}
                        <div className="bg-white rounded-3xl p-md border border-zinc-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-5 text-lime-600 select-none">
                                <span className="material-symbols-outlined" style={{ fontSize: "120px" }}>bolt</span>
                            </div>
                            <div className="flex justify-between items-start mb-lg relative z-10">
                                <div className="p-2 rounded-xl bg-lime-600 text-white">
                                    <span className="material-symbols-outlined">bolt</span>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="font-label-md text-label-md text-zinc-500 mb-xs">Daily Energy Expenditure</p>
                                <p className="font-headline-lg text-headline-lg text-lime-600">
                                    {displayTDEE.toLocaleString()} <span className="font-body-md text-body-md text-zinc-500">kcal</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Editable Data Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
                    
                    {/* Physical Data Card */}
                    <section className="bg-white rounded-3xl p-lg border border-zinc-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-headline-md text-headline-md text-zinc-800 mb-md">Physical Data</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-sm text-label-sm text-zinc-500">Weight (kg)</label>
                                    <input 
                                        className="bg-white border border-zinc-200 rounded-xl p-sm font-body-md text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none transition-all" 
                                        type="number" 
                                        value={weight}
                                        onChange={(e) => setWeight(Math.max(1, e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-sm text-label-sm text-zinc-500">Height (cm)</label>
                                    <input 
                                        className="bg-white border border-zinc-200 rounded-xl p-sm font-body-md text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none transition-all" 
                                        type="number" 
                                        value={height}
                                        onChange={(e) => setHeight(Math.max(1, e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-sm text-label-sm text-zinc-500">Gender</label>
                                    <select 
                                        className="bg-white border border-zinc-200 rounded-xl p-sm font-body-md text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none transition-all"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-xs">
                                    <label className="font-label-sm text-label-sm text-zinc-500">Date of Birth</label>
                                    <input 
                                        className="bg-white border border-zinc-200 rounded-xl p-sm font-body-md text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none transition-all" 
                                        type="date" 
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-xs md:col-span-2">
                                    <label className="font-label-sm text-label-sm text-zinc-500">Activity Level</label>
                                    <select 
                                        className="bg-white border border-zinc-200 rounded-xl p-sm font-body-md text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none transition-all"
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                    >
                                        {ACTIVITY_LEVELS.map((level) => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Dietary Profile Card */}
                    <section className="bg-white rounded-3xl p-lg border border-zinc-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="font-headline-md text-headline-md text-zinc-800 mb-md">Dietary Profile</h3>
                            <div className="space-y-lg">
                                {/* Main Goal */}
                                <div>
                                    <p className="font-label-md text-label-md text-zinc-500 mb-sm">Primary Goal</p>
                                    <div className="flex flex-wrap gap-sm">
                                        {HEALTH_GOALS.map((goal) => (
                                            <button 
                                                key={goal.value}
                                                type="button"
                                                onClick={() => setPrimaryHealthGoal(goal.value)}
                                                className={`px-4 py-2 rounded-full font-label-md text-label-md transition-all focus:outline-none ${
                                                    primaryHealthGoal === goal.value
                                                        ? "bg-lime-600 text-white shadow-sm"
                                                        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                                }`}
                                            >
                                                {goal.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Medical Conditions */}
                                <div>
                                    <p className="font-label-md text-label-md text-zinc-500 mb-sm">Medical Conditions</p>
                                    <div className="flex flex-wrap gap-sm items-center">
                                        {medicalConditions.map((condition, index) => {
                                            const match = MEDICAL_CONDITIONS.find(c => c.value === condition);
                                            return (
                                                <span key={index} className="px-4 py-2 rounded-full font-label-md text-label-md bg-rose-100 text-rose-500 flex items-center gap-2 select-none capitalize">
                                                    {match ? match.label : condition}
                                                    <button onClick={() => handleRemoveCondition(index)} type="button" className="hover:text-rose-600 transition-colors focus:outline-none">
                                                        <span className="material-symbols-outlined text-[16px] block">close</span>
                                                    </button>
                                                </span>
                                            );
                                        })}

                                        {showConditionInput ? (
                                            <div className="relative">
                                                <select 
                                                    className="bg-white border border-zinc-200 rounded-xl px-4 py-2 font-body-md text-sm text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none pr-10 cursor-pointer appearance-none"
                                                    value=""
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && !medicalConditions.includes(val)) {
                                                            setMedicalConditions(prev => {
                                                                if (val === 'none') return ['none'];
                                                                const filtered = prev.filter(item => item !== 'none');
                                                                return [...filtered, val];
                                                            });
                                                        }
                                                        setShowConditionInput(false);
                                                    }}
                                                    onBlur={() => setTimeout(() => setShowConditionInput(false), 200)}
                                                >
                                                    <option value="" disabled>Choose Condition...</option>
                                                    {MEDICAL_CONDITIONS.map(opt => (
                                                        <option 
                                                            key={opt.value} 
                                                            value={opt.value}
                                                            disabled={medicalConditions.includes(opt.value)}
                                                        >
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_more</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setShowConditionInput(true)}
                                                type="button" 
                                                className="px-4 py-2 rounded-full font-label-md text-label-md border border-dashed border-zinc-200 text-zinc-500 hover:bg-zinc-100 flex items-center gap-2 transition-colors focus:outline-none"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span> Add Condition
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Allergies */}
                                <div>
                                    <p className="font-label-md text-label-md text-zinc-500 mb-sm">Allergies &amp; Intolerances</p>
                                    <div className="flex flex-wrap gap-sm items-center">
                                        {allergies.map((allergy, index) => {
                                            const match = ALLERGIES.find(a => a.value === allergy);
                                            return (
                                                <span key={index} className="px-4 py-2 rounded-full font-label-md text-label-md bg-amber-100 text-amber-500 flex items-center gap-2 select-none capitalize">
                                                    {match ? match.label : allergy}
                                                    <button onClick={() => handleRemoveAllergy(index)} type="button" className="hover:text-amber-600 transition-colors focus:outline-none">
                                                        <span className="material-symbols-outlined text-[16px] block">close</span>
                                                    </button>
                                                </span>
                                            );
                                        })}

                                        {showAllergyInput ? (
                                            <div className="relative">
                                                <select 
                                                    className="bg-white border border-zinc-200 rounded-xl px-4 py-2 font-body-md text-sm text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 outline-none pr-10 cursor-pointer appearance-none"
                                                    value=""
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val && !allergies.includes(val)) {
                                                            setAllergies(prev => {
                                                                if (val === 'none') return ['none'];
                                                                const filtered = prev.filter(item => item !== 'none');
                                                                return [...filtered, val];
                                                            });
                                                        }
                                                        setShowAllergyInput(false);
                                                    }}
                                                    onBlur={() => setTimeout(() => setShowAllergyInput(false), 200)}
                                                >
                                                    <option value="" disabled>Choose Allergy...</option>
                                                    {ALLERGIES.map(opt => (
                                                        <option 
                                                            key={opt.value} 
                                                            value={opt.value}
                                                            disabled={allergies.includes(opt.value)}
                                                        >
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">expand_more</span>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => setShowAllergyInput(true)}
                                                type="button" 
                                                className="px-4 py-2 rounded-full font-label-md text-label-md border border-dashed border-zinc-200 text-zinc-500 hover:bg-zinc-100 flex items-center gap-2 transition-colors focus:outline-none"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add</span> Add Allergy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Server validation errors */}
            {errors && (
                <div className="max-w-container-max mx-auto px-gutter py-2">
                    {errors}
                </div>
            )}

            {/* Floating Save Banner (Smooth slide-in triggered by un-saved state changes) */}
            <div className={`fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg border-t border-zinc-200/30 px-gutter py-sm shadow-[0_-4px_12px_rgba(0,0,0,0.04)] z-50 transition-transform duration-300 ${
                hasUnsavedChanges ? "translate-y-0" : "translate-y-full"
            }`}>
                <div className="max-w-container-max mx-auto flex flex-col sm:flex-row justify-between items-center gap-sm">
                    <div className="flex items-center gap-sm text-zinc-800 select-none">
                        <span className="material-symbols-outlined text-orange-500">info</span>
                        <span className="font-body-md text-body-md">You have unsaved changes.</span>
                    </div>
                    <div className="flex items-center gap-sm w-full sm:w-auto">
                        <button 
                            onClick={handleDiscard}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-full font-label-md text-label-md text-zinc-500 hover:bg-zinc-100 transition-colors focus:outline-none"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={() => doRequest()}
                            className="flex-1 sm:flex-none px-6 py-2 rounded-full font-label-md text-label-md bg-lime-600 text-white hover:bg-lime-700 shadow-sm transition-all active:scale-95 focus:outline-none"
                        >
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
// 🎯 MAIN PARENT PROFILE WRAPPER COMPONENT
// =========================================================================
const ProfilePage = ({ profileData, currentUser }) => {
    if (!currentUser) return null; // Safe fallback if route guard is executing redirect

    // Dynamically choose between Vendor settings and Customer workspace based on role [4]
    if (currentUser.role === "vendor") {
        return (
            <VendorProfileView 
                profileData={profileData} 
                currentUser={currentUser} 
            />
        );
    }

    return (
        <CustomerProfileView 
            profileData={profileData} 
            currentUser={currentUser} 
        />
    );
};

// SSR pre-fetcher for user and profile data [4]
ProfilePage.getInitialProps = async (context, client, currentUser) => {
    // Route guard: anonymous users redirected to signin
    if (!currentUser) {
        if (context.res) {
            context.res.writeHead(302, { Location: "/auth/signin" });
            context.res.end();
        } else {
            Router.push("/auth/signin");
        }
        return { profileData: {} };
    }

    try {
        const { data } = await client.get("/api/users/profile");
        return { profileData: data, currentUser };
    } catch (err) {
        console.error("SSR Profile pre-load failure:", err.message);
        return { profileData: {}, currentUser };
    }
};

export default ProfilePage;