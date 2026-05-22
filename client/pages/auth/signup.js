import { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

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

const COUNTRY_CODES = [
    // Arab Countries
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
    // Other Countries
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+33', country: 'France' },
    { code: '+34', country: 'Spain' },
    { code: '+39', country: 'Italy' },
    { code: '+49', country: 'Germany' },
    { code: '+32', country: 'Belgium' },
    { code: '+31', country: 'Netherlands' },
    { code: '+41', country: 'Switzerland' }
];

export default function Signup() {
    const [step, setStep] = useState(1);
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        onSuccess: () => Router.push('/')
    });

    const [showPassword, setShowPassword] = useState(false);

    // Identity Data (Step 2)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('customer'); // Default selection is customer

    // Physical Profile Data (Step 3 - Customer Only)
    const [gender, setGender] = useState('male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [heightCM, setHeightCM] = useState('');
    const [weightKG, setWeightKG] = useState('');
    const [activityLevel, setActivityLevel] = useState('');

    // Health Goals Data (Step 4 - Customer Only)
    const [primaryHealthGoal, setPrimaryHealthGoal] = useState('');
    const [medicalCondition, setMedicalCondition] = useState([]);
    const [allergy, setAllergy] = useState([]);

    // Business Profile Data (Step 3 - Vendor Only)
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [countryCode, setCountryCode] = useState('+213');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [wilaya, setWilaya] = useState('');

    const handleCheckboxChange = (value, setState, currentState) => {
        // If "none" is being selected, clear all other options
        if (value === 'none') {
            setState(['none']);
        } 
        // If "none" is currently selected and user selects something else
        else if (currentState.includes('none')) {
            setState([value]);
        }
        // If unchecking a non-none option
        else if (currentState.includes(value)) {
            setState(currentState.filter(item => item !== value));
        }
        // If checking a new non-none option
        else {
            setState([...currentState, value]);
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

// Client-side Enforced Validators synced with express-validator bounds:
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const trimmedPassword = password.trim();
    const isStep2Valid = fullName.trim() !== "" && isEmailValid && trimmedPassword.length >= 6 && trimmedPassword.length <= 20;

    const parsedHeight = parseFloat(heightCM);
    const parsedWeight = parseFloat(weightKG);
    const isHeightValid = !isNaN(parsedHeight) && parsedHeight >= 50 && parsedHeight <= 250;
    const isWeightValid = !isNaN(parsedWeight) && parsedWeight >= 30 && parsedWeight <= 300;
    const isCustomerStep3Valid = dateOfBirth !== "" && isHeightValid && isWeightValid && activityLevel !== "";

    const isCustomerStep4Valid = primaryHealthGoal !== "";

    const isDisplayNameValid = displayName.trim().length >= 3 && displayName.trim().length <= 20;
    const isVendorFormValid = isDisplayNameValid && phoneNumber.trim() !== "" && address.trim() !== "" && wilaya !== "";


    const onSubmitFinal = async (event) => {
        event.preventDefault();

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
                allergy           
            };
        } else if (role === 'vendor') {
                
            // Remove spaces, dashes, and leading zero
            let cleanPhone = phoneNumber.replace(/[\s-]/g, '');
            if (cleanPhone.startsWith('0')) {
                cleanPhone = cleanPhone.substring(1);
            }

            payload.vendorData = {
                displayName,
                phoneNumber: `${countryCode}${phoneNumber}`,
                bio,
                location: { address, wilaya }
            };
        } 

        await doRequest(payload)
    };

    return (
        <div className="py-12 px-4 md:px-6 flex items-center justify-center bg-background min-h-[calc(100vh-56px)]">
            <main className={`w-full bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 md:p-10 relative overflow-hidden transition-all duration-300 ${
                step === 4 ? 'max-w-2xl' : 'max-w-xl'
            }`}>
                
                {/* Background Design Glow - Step 3 Vendor Only */}
                {step === 3 && role === 'vendor' && (
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-primary-container opacity-10 blur-3xl pointer-events-none"></div>
                )}

                {/* ================= STEP 1: ROLE SELECTION ================= */}
                {step === 1 && (
                    <div>
                        <header className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Welcome to NutriSync</h1>
                            <p className="text-lg text-on-surface-variant">How would you like to use our platform?</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
                            <button 
                                type="button"
                                onClick={() => setRole('customer')}
                                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group focus:outline-none ${
                                    role === 'customer' 
                                        ? 'border-primary bg-surface-container-low ring-4 ring-primary/10' 
                                        : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                                }`}
                            >
                                <div className="absolute top-4 right-4 text-primary">
                                    <span className="material-symbols-outlined text-xl">
                                        {role === 'customer' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-outline-variant/20 transition-colors ${
                                    role === 'customer' 
                                        ? 'bg-surface-container-lowest text-primary' 
                                        : 'bg-surface-container text-on-surface-variant group-hover:text-primary'
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">monitor_heart</span>
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-2">Personal Account</h3>
                                <p className="text-sm text-on-surface-variant">Get AI diet plans &amp; buy healthy food.</p>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setRole('vendor')}
                                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group focus:outline-none ${
                                    role === 'vendor' 
                                        ? 'border-primary bg-surface-container-low ring-4 ring-primary/10' 
                                        : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:bg-surface-container-low'
                                }`}
                            >
                                <div className="absolute top-4 right-4 text-primary">
                                    <span className="material-symbols-outlined text-xl">
                                        {role === 'vendor' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-outline-variant/20 transition-colors ${
                                    role === 'vendor' 
                                        ? 'bg-surface-container-lowest text-primary' 
                                        : 'bg-surface-container text-on-surface-variant group-hover:text-primary'
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">storefront</span>
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-2">Vendor Account</h3>
                                <p className="text-sm text-on-surface-variant">Sell healthy products on the marketplace.</p>
                            </button>
                        </div>

                        <div className="mt-8">
                            <button 
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-primary hover:bg-primary/90 text-on-primary font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
                            >
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: BASIC IDENTITY ================= */}
                {step === 2 && (
                    <div>
                        <div className="mb-8">
                            <span className="font-semibold text-xs text-primary mb-2 block uppercase tracking-wider">
                                Step 2 of {role === 'customer' ? '4' : '3'}
                            </span>
                            <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Create your account</h1>
                            <p className="text-sm text-on-surface-variant">Let's start with your basic details.</p>
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (isStep2Valid) {
                                    handleNext();
                                }
                            }} 
                            className="space-y-6"
                        >
                            <div className="relative group">
                                <label className="sr-only" htmlFor="fullName">Full Name</label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">person</span>
                                </div>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-surface placeholder-outline" 
                                    id="fullName" 
                                    name="fullName" 
                                    placeholder="John Doe" 
                                    required 
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <label className="sr-only" htmlFor="email">Email Address</label>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                                </div>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-surface placeholder-outline" 
                                    id="email" 
                                    name="email" 
                                    placeholder="john@example.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="relative group">
                                    <label className="sr-only" htmlFor="password">Password</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                                    </div>
                                    <input 
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-on-surface placeholder-outline" 
                                        id="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button 
                                        aria-label="Toggle password visibility" 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors focus:outline-none" 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined select-none">
                                            {showPassword ? "visibility" : "visibility_off"}
                                        </span>
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-on-surface-variant ml-1">Must be between 6 and 20 characters.</p>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4">
                                <button 
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors focus:outline-none" 
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back
                                </button>

                                {isStep2Valid ? (
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm bg-primary hover:bg-secondary text-on-primary shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button 
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm bg-surface-variant text-outline-variant cursor-not-allowed transition-all" 
                                        disabled 
                                        type="button"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* ================= STEP 3: VENDOR PROFILE DETAILS ================= */}
                {step === 3 && role === 'vendor' && (
                    <div>
                        <div className="mb-8">
                            <p className="font-semibold text-xs text-primary uppercase tracking-wider mb-2">STEP 3 OF 3</p>
                            <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Store Details</h1>
                            <p className="text-sm text-on-surface-variant">Set up your marketplace presence to start selling healthy products.</p>
                        </div>

                        <form onSubmit={onSubmitFinal} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="store-name">Store Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-lg">storefront</span>
                                    </div>
                                    <input 
                                        className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                        id="store-name" 
                                        name="store-name" 
                                        placeholder="Nature's Harvest" 
                                        required 
                                        type="text"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="bio">Short Bio (Optional)</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm resize-none" 
                                    id="bio" 
                                    name="bio" 
                                    placeholder="We sell 100% organic..." 
                                    rows="3"
                                    value={bio}
                                    onChange={e => setBio(e.target.value.substring(0, 500))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="phone">Business Phone Number</label>
                                <div className="flex gap-2 mb-1">
                                    <div className="relative w-1/3">
                                        <select 
                                            value={countryCode} 
                                            onChange={e => setCountryCode(e.target.value)} 
                                            className="w-full pl-3 pr-10 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm appearance-none"
                                        >
                                            {COUNTRY_CODES.map(item => (
                                                <option key={item.code} value={item.code}>
                                                    {item.code} ({item.country})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="relative w-2/3">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-lg">call</span>
                                        </div>
                                        <input 
                                            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                            id="phone" 
                                            name="phone" 
                                            placeholder="779610317" 
                                            required 
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-on-surface-variant ml-1">Must enter the local number body (e.g. 779610317)</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="address">Street Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-lg">location_on</span>
                                        </div>
                                        <input 
                                            className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                            id="address" 
                                            name="address" 
                                            placeholder="123 Market St" 
                                            required 
                                            type="text"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2" htmlFor="wilaya">Wilaya (Province)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full pl-4 pr-10 py-3 bg-surface-container rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm appearance-none" 
                                            id="wilaya" 
                                            name="wilaya" 
                                            required
                                            value={wilaya}
                                            onChange={e => setWilaya(e.target.value)}
                                        >
                                            <option disabled value="">Select Wilaya</option>
                                            <option value="16">16 - Alger</option>
                                            <option value="31">31 - Oran</option>
                                            <option value="25">25 - Constantine</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-surface-variant">
                                <button 
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                    Back
                                </button>
                                
                                {isVendorFormValid ? (
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-secondary transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20"
                                    >
                                        Create Vendor Account
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        disabled 
                                        className="flex items-center gap-2 px-6 py-3 bg-surface-variant text-outline-variant rounded-xl text-sm font-semibold cursor-not-allowed opacity-50"
                                    >
                                        Create Vendor Account
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* ================= STEP 3: CUSTOMER PHYSICAL PROFILE ================= */}
                {step === 3 && role === 'customer' && (
                    <div>
                        <div className="mb-8">
                            <span className="block text-primary font-semibold text-xs mb-2">STEP 3 OF 4</span>
                            <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Your Physical Profile</h1>
                            <p className="text-sm text-on-surface-variant">This helps our AI calculate your precise nutritional needs.</p>
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (isCustomerStep3Valid) {
                                    handleNext();
                                }
                            }}
                            className="flex flex-col gap-6"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-1.5">Gender</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex items-center justify-center py-3 rounded-lg transition-colors focus:outline-none ${
                                            gender === 'male'
                                                ? 'border-2 border-primary bg-surface-container-low ring-2 ring-primary ring-opacity-20 text-primary font-bold'
                                                : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface text-on-surface-variant font-semibold'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex items-center justify-center py-3 rounded-lg transition-colors focus:outline-none ${
                                            gender === 'female'
                                                ? 'border-2 border-primary bg-surface-container-low ring-2 ring-primary ring-opacity-20 text-primary font-bold'
                                                : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface text-on-surface-variant font-semibold'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="dob">Date of Birth</label>
                                <input 
                                    className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                                    id="dob" 
                                    type="date"
                                    required
                                    value={dateOfBirth}
                                    onChange={e => setDateOfBirth(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="height">Height</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none" 
                                            id="height" 
                                            placeholder="175" 
                                            type="number"
                                            required
                                            value={heightCM}
                                            onChange={e => setHeightCM(e.target.value)}
                                        />
                                        <span className="absolute right-4 text-sm text-on-surface-variant pointer-events-none">cm</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="weight">Weight</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-4 pr-12 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none" 
                                            id="weight" 
                                            placeholder="70" 
                                            type="number"
                                            required
                                            value={weightKG}
                                            onChange={e => setWeightKG(e.target.value)}
                                        />
                                        <span className="absolute right-4 text-sm text-on-surface-variant pointer-events-none">kg</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-1.5" htmlFor="activity">Activity Level</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-surface-bright border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none pr-10" 
                                        id="activity"
                                        value={activityLevel}
                                        onChange={e => setActivityLevel(e.target.value)}
                                    >
                                        <option value="sedentary">Sedentary</option>
                                        <option value="lightly_active">Lightly Active</option>
                                        <option value="moderately_active">Moderately Active</option>
                                        <option value="active">Active</option>
                                        <option value="very_active">Very Active</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between items-center border-t border-outline-variant/30 pt-6">
                                <button 
                                    type="button" 
                                    onClick={handleBack}
                                    className="flex items-center text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm px-4 py-2 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined mr-2 text-[20px]">arrow_back</span>
                                    Back
                                </button>
                                
                                {isCustomerStep3Valid ? (
                                    <button 
                                        type="submit"
                                        className="flex items-center bg-primary text-on-primary hover:bg-secondary transition-colors font-semibold text-sm px-6 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        disabled
                                        className="flex items-center bg-surface-variant text-outline-variant opacity-50 cursor-not-allowed font-semibold text-sm px-6 py-3 rounded-lg"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* ================= STEP 4: CUSTOMER HEALTH GOALS & CONDITIONS ================= */}
                {step === 4 && role === 'customer' && (
                    <div>
                        <header className="mb-10 text-center">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <span className="font-semibold text-xs text-primary tracking-widest uppercase">Step 4 of 4</span>
                            </div>
                            <h1 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">Your Health Goals</h1>
                            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                                Tell us what you want to achieve and any dietary restrictions to tailor your experience.
                            </p>
                        </header>

                        <form onSubmit={onSubmitFinal} className="space-y-10">
                            <section>
                                <h2 className="text-lg font-bold text-on-surface mb-4">What is your main goal?</h2>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: 'weight_loss', name: 'Weight Loss' },
                                        { id: 'muscle_gain', name: 'Muscle Gain' },
                                        { id: 'maintenance', name: 'Maintenance' },
                                        { id: 'improved_energy', name: 'Improved Energy' },
                                        { id: 'other', name: 'Other' }
                                    ].map((goal) => (
                                        <button 
                                            key={goal.id}
                                            type="button"
                                            onClick={() => setPrimaryHealthGoal(goal.id)}
                                            className={`px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-sm focus:outline-none ${
                                                primaryHealthGoal === goal.id
                                                    ? 'bg-primary text-on-primary'
                                                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                                            }`}
                                        >
                                            {goal.name}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <hr className="border-outline-variant opacity-50" />

                            <section>
                                <h2 className="text-lg font-bold text-on-surface mb-2">Medical Conditions</h2>
                                <p className="text-sm text-on-surface-variant mb-4">Select all that apply</p>
                                <div className="flex flex-wrap gap-3">
                                    {MEDICAL_CONDITIONS.map((condition) => {
                                        const isSelected = medicalCondition.includes(condition.value);
                                        return (
                                            <button 
                                                key={condition.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(condition.value, setMedicalCondition, medicalCondition)}
                                                disabled={medicalCondition.includes('none') && condition.value !== 'none'}
                                                className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-tertiary bg-error-container text-on-error-container'
                                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                                {condition.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <hr className="border-outline-variant opacity-50" />

                            <section>
                                <h2 className="text-lg font-bold text-on-surface mb-4">Allergies &amp; Intolerances</h2>
                                <div className="flex flex-wrap gap-3">
                                    {ALLERGIES.map((allergen) => {
                                        const isSelected = allergy.includes(allergen.value);
                                        return (
                                            <button 
                                                key={allergen.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(allergen.value, setAllergy, allergy)}
                                                disabled={allergy.includes('none') && allergen.value !== 'none'}
                                                className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-[#f59e0b] bg-[#fef3c7] text-[#92400e]'
                                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                                {allergen.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="mt-12 flex items-center justify-between pt-6 border-t border-outline-variant">
                                <button 
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-semibold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-surface-container-low focus:outline-none"
                                >
                                    <span className="material-symbols-outlined">arrow_left</span>
                                    Back
                                </button>
                                
                                {isCustomerStep4Valid ? (
                                    <button 
                                        type="submit"
                                        className="flex items-center gap-2 bg-primary hover:bg-on-primary-container text-on-primary font-semibold text-sm px-8 py-4 rounded-xl shadow-[0_8px_16px_-4px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                        Create Account
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        disabled
                                        className="flex items-center gap-2 bg-surface-variant text-outline-variant font-semibold text-sm px-8 py-4 rounded-xl opacity-50 cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Server Request Errors */}
                {errors && <div className="mt-6">{errors}</div>}

            </main>
        </div>
    );
}