import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const HEALTH_GOALS = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'improved_energy', label: 'Improved Energy' },
];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'lightly_active', label: 'Lightly Active' },
    { value: 'moderately_active', label: 'Moderately Active' },
    { value: 'active', label: 'Active' },
    { value: 'very_active', label: 'Very Active' },
];

const MEDICAL_CONDITIONS = [
    { value: 'diabetes_type_1', label: 'Type 1 Diabetes' },
    { value: 'diabetes_type_2', label: 'Type 2 Diabetes' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'high_cholesterol', label: 'High Cholesterol' },
    { value: 'celiac_disease', label: 'Celiac Disease' },
    { value: 'ibs', label: 'IBS' },
    { value: 'anemia', label: 'Anemia' },
    { value: 'thyroid_disorder', label: 'Thyroid Disorder' },
    { value: 'pcos', label: 'PCOS' },
    { value: 'none', label: 'None' },
];

const ALLERGIES = [
    { value: 'lactose', label: 'Lactose' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'none', label: 'None' },
];

const WILAYAS = [
    '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna',
    '06 - Béjaïa', '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira',
    '11 - Tamanrasset', '12 - Tébessa', '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou',
    '16 - Alger', '17 - Djelfa', '18 - Jijel', '19 - Sétif', '20 - Saïda',
    '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma', '25 - Constantine',
    '26 - Médéa', '27 - Mostaganem', '28 - MSila', '29 - Mascara', '30 - Ouargla',
    '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès',
    '36 - El Tarf', '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela',
    '41 - Souk Ahras', '42 - Tipaza', '43 - Mila', '44 - Aïn Defla', '45 - Naâma',
    '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane', '49 - Timimoun', '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah', '54 - In Guezzam', '55 - Touggourt',
    '56 - Djanet', '57 - El MGhair', '58 - El Meniaa',
];

const COUNTRY_CODES = [
    { code: '+213', country: 'Algeria' },
    { code: '+20', country: 'Egypt' },
    { code: '+966', country: 'Saudi Arabia' },
    { code: '+971', country: 'UAE' },
    { code: '+962', country: 'Jordan' },
    { code: '+961', country: 'Lebanon' },
    { code: '+212', country: 'Morocco' },
    { code: '+216', country: 'Tunisia' },
    { code: '+965', country: 'Kuwait' },
    { code: '+974', country: 'Qatar' },
    { code: '+973', country: 'Bahrain' },
    { code: '+968', country: 'Oman' },
    { code: '+967', country: 'Yemen' },
    { code: '+963', country: 'Syria' },
    { code: '+970', country: 'Palestine' },
    { code: '+964', country: 'Iraq' },
    { code: '+218', country: 'Libya' },
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+34', country: 'Spain' },
    { code: '+39', country: 'Italy' },
    { code: '+49', country: 'Germany' },
    { code: '+32', country: 'Belgium' },
    { code: '+31', country: 'Netherlands' },
    { code: '+41', country: 'Switzerland' },
];

const PageShell = ({ children }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile md:p-gutter">
        <main className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 md:p-10">
            {children}
        </main>
    </div>
);

const StepBadge = ({ children }) => (
    <span className="block text-primary font-label-md text-label-md mb-2 uppercase tracking-wider">
        {children}
    </span>
);

const PrimaryButton = ({ children, onClick, type = 'button', disabled, className = '' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={
            disabled
                ? `flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label-md text-label-md bg-surface-variant text-outline-variant cursor-not-allowed transition-all ${className}`
                : `flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-label-md text-label-md bg-primary hover:bg-on-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 ${className}`
        }
    >
        {children}
    </button>
);

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
    >
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Back
    </button>
);

const ErrorBanner = ({ errors }) => {
    if (!errors) return null;
    return (
        <div className="mt-4 p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container">
            {errors}
        </div>
    );
};

function RoleStep({ role, setRole, onContinue }) {
    return (
        <>
            <header className="flex flex-col items-center text-center mb-10">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome to NutriSync</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">How would you like to use our platform?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
                <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                        role === 'customer'
                            ? 'border-primary bg-surface-container-low ring-4 ring-primary/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                    }`}
                >
                    <div className={`absolute top-4 right-4 ${role === 'customer' ? 'text-primary' : 'text-outline-variant'}`}>
                        <span className="material-symbols-outlined text-xl">
                            {role === 'customer' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-outline-variant/20 ${
                        role === 'customer' ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                        <span className="material-symbols-outlined text-2xl">monitor_heart</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Personal Account</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Get AI diet plans &amp; buy healthy food.</p>
                </button>

                <button
                    type="button"
                    onClick={() => setRole('vendor')}
                    className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                        role === 'vendor'
                            ? 'border-primary bg-surface-container-low ring-4 ring-primary/10'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                    }`}
                >
                    <div className={`absolute top-4 right-4 ${role === 'vendor' ? 'text-primary' : 'text-outline-variant'}`}>
                        <span className="material-symbols-outlined text-xl">
                            {role === 'vendor' ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-outline-variant/20 ${
                        role === 'vendor' ? 'bg-surface-container-lowest text-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}>
                        <span className="material-symbols-outlined text-2xl">storefront</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Vendor Account</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">Sell healthy products on the marketplace.</p>
                </button>
            </div>

            <button
                type="button"
                onClick={onContinue}
                className="w-full bg-primary hover:bg-on-primary-container text-on-primary font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
                Continue
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
        </>
    );
}

function IdentityStep({ role, fullName, setFullName, email, setEmail, password, setPassword, onBack, onContinue }) {
    const [showPassword, setShowPassword] = useState(false);
    const totalSteps = role === 'customer' ? 4 : 3;
    const canContinue = fullName.trim() && email.trim() && password.length >= 6 && password.length <= 20;

    return (
        <>
            <div className="mb-8">
                <StepBadge>Step 2 of {totalSteps}</StepBadge>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create your account</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">Let&apos;s start with your basic details.</p>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); if (canContinue) onContinue(); }}
                className="space-y-6"
            >
                <div className="relative group">
                    <label className="sr-only" htmlFor="fullName">Full Name</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">person</span>
                    </div>
                    <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-body-md text-on-surface placeholder-outline"
                    />
                </div>

                <div className="relative group">
                    <label className="sr-only" htmlFor="email">Email Address</label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                    </div>
                    <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-body-md text-on-surface placeholder-outline"
                    />
                </div>

                <div>
                    <div className="relative group">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            maxLength={20}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-body-md text-on-surface placeholder-outline"
                        />
                        <button
                            type="button"
                            aria-label="Toggle password visibility"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                    <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant ml-1">
                        Must be between 6 and 20 characters.
                    </p>
                </div>

                <div className="flex items-center justify-between mt-8 pt-4">
                    <BackButton onClick={onBack} />
                    <PrimaryButton type="submit" disabled={!canContinue}>
                        Continue
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
}

function PhysicalProfileStep({
    gender, setGender,
    dateOfBirth, setDateOfBirth,
    heightCM, setHeightCM,
    weightKG, setWeightKG,
    activityLevel, setActivityLevel,
    onBack, onContinue,
}) {
    const canContinue = !!gender && !!dateOfBirth && !!heightCM && !!weightKG && !!activityLevel;

    return (
        <>
            <div className="mb-8">
                <StepBadge>Step 3 of 4</StepBadge>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Your Physical Profile</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    This helps our AI calculate your precise nutritional needs.
                </p>
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); if (canContinue) onContinue(); }}
                className="flex flex-col gap-6"
            >
                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5">Gender</label>
                    <div className="grid grid-cols-2 gap-4">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`flex items-center justify-center py-3 rounded-lg transition-colors capitalize ${
                                    gender === g
                                        ? 'border-2 border-primary bg-surface-container-low ring-2 ring-primary/20'
                                        : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                                }`}
                            >
                                <span className={`font-label-md text-label-md ${gender === g ? 'text-primary' : 'text-on-surface-variant'}`}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="dob">Date of Birth</label>
                    <input
                        id="dob"
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="height">Height</label>
                        <div className="relative flex items-center">
                            <input
                                id="height"
                                type="number"
                                required
                                value={heightCM}
                                onChange={(e) => setHeightCM(e.target.value)}
                                placeholder="175"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                            />
                            <span className="absolute right-4 font-body-md text-body-md text-on-surface-variant pointer-events-none">cm</span>
                        </div>
                    </div>
                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="weight">Weight</label>
                        <div className="relative flex items-center">
                            <input
                                id="weight"
                                type="number"
                                required
                                value={weightKG}
                                onChange={(e) => setWeightKG(e.target.value)}
                                placeholder="70"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-4 pr-12 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none"
                            />
                            <span className="absolute right-4 font-body-md text-body-md text-on-surface-variant pointer-events-none">kg</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="activity">Activity Level</label>
                    <div className="relative">
                        <select
                            id="activity"
                            required
                            value={activityLevel}
                            onChange={(e) => setActivityLevel(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none pr-10"
                        >
                            <option value="" disabled>Select Activity Level</option>
                            {ACTIVITY_LEVELS.map((l) => (
                                <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                            arrow_drop_down
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <BackButton onClick={onBack} />
                    <PrimaryButton type="submit" disabled={!canContinue}>
                        Continue
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
}

function HealthGoalsStep({
    primaryHealthGoal, setPrimaryHealthGoal,
    medicalCondition, setMedicalCondition,
    allergy, setAllergy,
    errors, submitting,
    onBack, onSubmit,
}) {
    const toggleMulti = (value, currentState, setState) => {
        if (value === 'none') {
            setState(['none']);
            return;
        }
        if (currentState.includes('none')) {
            setState([value]);
            return;
        }
        if (currentState.includes(value)) {
            setState(currentState.filter((v) => v !== value));
        } else {
            setState([...currentState, value]);
        }
    };

    const canSubmit = !!primaryHealthGoal && !submitting;

    return (
        <>
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 mb-4">
                    <StepBadge>Step 4 of 4</StepBadge>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Your Health Goals</h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
                    Tell us what you want to achieve and any dietary restrictions to tailor your experience.
                </p>
            </header>

            <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} className="space-y-10">
                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-4">What is your main goal?</h2>
                    <div className="flex flex-wrap gap-3">
                        {HEALTH_GOALS.map((g) => {
                            const selected = primaryHealthGoal === g.value;
                            return (
                                <button
                                    key={g.value}
                                    type="button"
                                    onClick={() => setPrimaryHealthGoal(g.value)}
                                    className={`px-6 py-3 rounded-full font-label-md text-label-md transition-all ${
                                        selected
                                            ? 'bg-primary text-on-primary shadow-sm'
                                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <hr className="border-outline-variant opacity-50" />

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Medical Conditions</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">Select all that apply</p>
                    <div className="flex flex-wrap gap-3">
                        {MEDICAL_CONDITIONS.map((c) => {
                            const selected = medicalCondition.includes(c.value);
                            const disabled = medicalCondition.includes('none') && c.value !== 'none';
                            return (
                                <button
                                    key={c.value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => toggleMulti(c.value, medicalCondition, setMedicalCondition)}
                                    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                                        selected
                                            ? 'border border-tertiary bg-error-container text-on-error-container'
                                            : `border border-outline-variant bg-surface-container-lowest text-on-surface-variant ${
                                                  disabled
                                                      ? 'opacity-40 cursor-not-allowed'
                                                      : 'hover:border-primary hover:text-primary'
                                              }`
                                    }`}
                                >
                                    {selected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <hr className="border-outline-variant opacity-50" />

                <section>
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Allergies &amp; Intolerances</h2>
                    <div className="flex flex-wrap gap-3">
                        {ALLERGIES.map((a) => {
                            const selected = allergy.includes(a.value);
                            const disabled = allergy.includes('none') && a.value !== 'none';
                            return (
                                <button
                                    key={a.value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => toggleMulti(a.value, allergy, setAllergy)}
                                    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                                        selected
                                            ? 'border border-[#f59e0b] bg-[#fef3c7] text-[#92400e]'
                                            : `border border-outline-variant bg-surface-container-lowest text-on-surface-variant ${
                                                  disabled
                                                      ? 'opacity-40 cursor-not-allowed'
                                                      : 'hover:border-primary hover:text-primary'
                                              }`
                                    }`}
                                >
                                    {selected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                    {a.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <ErrorBanner errors={errors} />

                <div className="mt-12 flex items-center justify-between pt-6 border-t border-outline-variant">
                    <BackButton onClick={onBack} />
                    <PrimaryButton type="submit" disabled={!canSubmit}>
                        <span className="material-symbols-outlined">check</span>
                        Create Account
                    </PrimaryButton>
                </div>
            </form>
        </>
    );
}

function VendorStoreStep({
    displayName, setDisplayName,
    bio, setBio,
    countryCode, setCountryCode,
    phoneNumber, setPhoneNumber,
    address, setAddress,
    wilaya, setWilaya,
    errors, submitting,
    onBack, onSubmit,
}) {
    const canSubmit = !!displayName && !!phoneNumber && !!address && !!wilaya && !submitting;

    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-primary-container opacity-10 blur-3xl pointer-events-none" />

            <div className="mb-8">
                <StepBadge>Step 3 of 3</StepBadge>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Store Details</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Set up your marketplace presence to start selling healthy products.
                </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} className="space-y-6">
                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="store-name">Store Name</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                            <span className="material-symbols-outlined text-lg">storefront</span>
                        </div>
                        <input
                            id="store-name"
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Nature's Harvest"
                            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
                        />
                    </div>
                </div>

                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="bio">
                        Short Bio (Optional)
                    </label>
                    <textarea
                        id="bio"
                        rows={3}
                        maxLength={500}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="We sell 100% organic..."
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md resize-none"
                    />
                    <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant ml-1">
                        {bio.length}/500 characters
                    </p>
                </div>

                <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="phone">
                        Business Phone Number
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-surface-container rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md px-3 py-3 max-w-[160px]"
                            aria-label="Country code"
                        >
                            {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                            ))}
                        </select>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                <span className="material-symbols-outlined text-lg">call</span>
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="XXX XX XX XX"
                                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
                            />
                        </div>
                    </div>
                    <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant ml-1">
                        Must include country code (e.g., +213)
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="address">
                            Street Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                <span className="material-symbols-outlined text-lg">location_on</span>
                            </div>
                            <input
                                id="address"
                                type="text"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Market St"
                                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="wilaya">
                            Wilaya (Province)
                        </label>
                        <div className="relative">
                            <select
                                id="wilaya"
                                required
                                value={wilaya}
                                onChange={(e) => setWilaya(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow font-body-md text-body-md appearance-none"
                            >
                                <option value="" disabled>Select Wilaya</option>
                                {WILAYAS.map((w) => (
                                    <option key={w} value={w}>{w}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ErrorBanner errors={errors} />

                <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-variant">
                    <BackButton onClick={onBack} />
                    <PrimaryButton type="submit" disabled={!canSubmit}>
                        Create Vendor Account
                        <span className="material-symbols-outlined text-lg">check</span>
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}

export default function Signup() {
    const [step, setStep] = useState('role');
    const [submitting, setSubmitting] = useState(false);

    // Identity
    const [role, setRole] = useState('customer');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Customer
    const [gender, setGender] = useState('male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [heightCM, setHeightCM] = useState('');
    const [weightKG, setWeightKG] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const [primaryHealthGoal, setPrimaryHealthGoal] = useState('');
    const [medicalCondition, setMedicalCondition] = useState([]);
    const [allergy, setAllergy] = useState([]);

    // Vendor
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [countryCode, setCountryCode] = useState('+213');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [wilaya, setWilaya] = useState('');

    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        onSuccess: () => Router.push('/'),
    });

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = { email, password, fullName, role };

            if (role === 'customer') {
                payload.healthData = {
                    gender,
                    dateOfBirth,
                    heightCM: parseFloat(heightCM),
                    weightKG: parseFloat(weightKG),
                    activityLevel,
                    primaryHealthGoal,
                    medicalCondition,
                    allergy,
                };
            } else {
                let cleanPhone = phoneNumber.replace(/[\s-]/g, '');
                if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
                payload.vendorData = {
                    displayName,
                    bio,
                    phoneNumber: `${countryCode}${cleanPhone}`,
                    location: { address, wilaya },
                };
            }

            await doRequest(payload);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <PageShell>
            {step === 'role' && (
                <RoleStep
                    role={role}
                    setRole={setRole}
                    onContinue={() => setStep('identity')}
                />
            )}

            {step === 'identity' && (
                <IdentityStep
                    role={role}
                    fullName={fullName}
                    setFullName={setFullName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    onBack={() => setStep('role')}
                    onContinue={() => setStep(role === 'customer' ? 'physical' : 'store')}
                />
            )}

            {step === 'physical' && role === 'customer' && (
                <PhysicalProfileStep
                    gender={gender}
                    setGender={setGender}
                    dateOfBirth={dateOfBirth}
                    setDateOfBirth={setDateOfBirth}
                    heightCM={heightCM}
                    setHeightCM={setHeightCM}
                    weightKG={weightKG}
                    setWeightKG={setWeightKG}
                    activityLevel={activityLevel}
                    setActivityLevel={setActivityLevel}
                    onBack={() => setStep('identity')}
                    onContinue={() => setStep('health')}
                />
            )}

            {step === 'health' && role === 'customer' && (
                <HealthGoalsStep
                    primaryHealthGoal={primaryHealthGoal}
                    setPrimaryHealthGoal={setPrimaryHealthGoal}
                    medicalCondition={medicalCondition}
                    setMedicalCondition={setMedicalCondition}
                    allergy={allergy}
                    setAllergy={setAllergy}
                    errors={errors}
                    submitting={submitting}
                    onBack={() => setStep('physical')}
                    onSubmit={handleSubmit}
                />
            )}

            {step === 'store' && role === 'vendor' && (
                <VendorStoreStep
                    displayName={displayName}
                    setDisplayName={setDisplayName}
                    bio={bio}
                    setBio={setBio}
                    countryCode={countryCode}
                    setCountryCode={setCountryCode}
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    address={address}
                    setAddress={setAddress}
                    wilaya={wilaya}
                    setWilaya={setWilaya}
                    errors={errors}
                    submitting={submitting}
                    onBack={() => setStep('identity')}
                    onSubmit={handleSubmit}
                />
            )}
        </PageShell>
    );
}
