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
    { code: '+41', country: 'Switzerland' }
];

export default function Signup() {
    const [step, setStep] = useState(1);
    const [touchedFields, setTouchedFields] = useState({});

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
    const [role, setRole] = useState('customer');

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
        if (value === 'none') {
            setState(['none']);
        } else if (currentState.includes('none')) {
            setState([value]);
        } else if (currentState.includes(value)) {
            setState(currentState.filter(item => item !== value));
        } else {
            setState([...currentState, value]);
        }
    };

    const handleNext = () => {
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    const normalizedEmail = email.trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const trimmedPassword = password.trim();
    
    const isFullNameValid = fullName.trim().length >= 2;
    const isPasswordValid = trimmedPassword.length >= 6 && trimmedPassword.length <= 20;
    const isStep2Valid = isFullNameValid && isEmailValid && isPasswordValid;

    const parsedHeight = parseFloat(heightCM);
    const parsedWeight = parseFloat(weightKG);
    const isHeightValid = !isNaN(parsedHeight) && parsedHeight >= 50 && parsedHeight <= 250;
    const isWeightValid = !isNaN(parsedWeight) && parsedWeight >= 30 && parsedWeight <= 300;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const isDOBValid = dateOfBirth !== "" && dateOfBirth <= todayStr;
    const isCustomerStep3Valid = isDOBValid && isHeightValid && isWeightValid && activityLevel !== "";

    const isCustomerStep4Valid = primaryHealthGoal !== "";

    let cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
    }
    const isPhoneLengthValid = cleanPhone.length >= 8 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);

    const isDisplayNameValid = displayName.trim().length >= 3 && displayName.trim().length <= 20;
    const isVendorFormValid = isDisplayNameValid && isPhoneLengthValid && address.trim() !== "" && wilaya !== "";

    const onSubmitFinal = async (event) => {
        event.preventDefault();

        const payload = { 
            email: normalizedEmail, 
            password: trimmedPassword, 
            fullName: fullName.trim(), 
            role 
        };

        if (role === 'customer') {
            payload.healthData = {
                gender,
                dateOfBirth,
                heightCM: parsedHeight,
                weightKG: parsedWeight,
                activityLevel,
                primaryHealthGoal,
                medicalCondition: medicalCondition.length > 0 ? medicalCondition : ['none'], 
                allergy: allergy.length > 0 ? allergy : ['none']           
            };
        } else if (role === 'vendor') {
            payload.vendorData = {
                displayName: displayName.trim(),
                phoneNumber: `${countryCode}${cleanPhone}`,
                bio: bio.trim(),
                location: { address: address.trim(), wilaya }
            };
        } 

        await doRequest(payload);
    };

    return (
        <div className="bg-orange-50/50 min-h-[calc(100vh-56px)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-lime-200/20 blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-yellow-200/20 blur-[80px] -z-10 pointer-events-none"></div>

            <main className={`w-full bg-white rounded-[1.5rem] shadow-lg border border-zinc-200 p-6 md:p-10 relative z-10 transition-all duration-300 ${
                step === 4 && role === 'customer' ? 'max-w-2xl' : 'max-w-xl'
            }`}>
                {step === 3 && role === 'vendor' && (
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-lime-100 opacity-10 blur-3xl pointer-events-none"></div>
                )}

                {/* STEP 1: ROLE SELECTION */}
                {step === 1 && (
                    <div>
                        <header className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-lime-600 text-3xl">eco</span>
                            </div>
                            <h1 className="font-headline text-[32px] font-bold tracking-tight text-zinc-900 mb-2">Welcome to GhidhAI</h1>
                            <p className="font-body text-[18px] text-zinc-600">How would you like to use our platform?</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
                            <button 
                                type="button"
                                onClick={() => setRole('customer')}
                                className={`relative text-left p-6 rounded-2xl border-4 transition-all duration-200 group focus:outline-none ${
                                    role === 'customer' 
                                        ? 'border-lime-600 bg-lime-50 ring-4 ring-lime-600/10' 
                                        : 'border-zinc-200 bg-white hover:border-lime-600/40 hover:bg-zinc-50'
                                }`}
                            >
                                <div className={`absolute top-4 right-4 ${role === 'customer' ? 'text-lime-600' : 'text-transparent group-hover:text-zinc-400 transition-colors'}`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {role === 'customer' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-zinc-200 transition-colors ${
                                    role === 'customer' 
                                        ? 'bg-white text-lime-600' 
                                        : 'bg-zinc-100 text-zinc-500 group-hover:text-lime-600'
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">monitor_heart</span>
                                </div>
                                <h3 className="font-headline text-[24px] font-semibold text-zinc-900 mb-2">Personal Account</h3>
                                <p className="font-body text-[16px] text-zinc-700">Get AI diet plans &amp; buy healthy food.</p>
                            </button>

                            <button 
                                type="button"
                                onClick={() => setRole('vendor')}
                                className={`relative text-left p-6 rounded-2xl border-4 transition-all duration-200 group focus:outline-none ${
                                    role === 'vendor' 
                                        ? 'border-lime-600 bg-lime-50 ring-4 ring-lime-600/10' 
                                        : 'border-2 border-zinc-200 bg-white hover:border-lime-600/40 hover:bg-zinc-50'
                                }`}
                            >
                                <div className={`absolute top-4 right-4 ${role === 'vendor' ? 'text-lime-600' : 'text-transparent group-hover:text-zinc-400 transition-colors'}`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {role === 'vendor' ? 'check_circle' : 'radio_button_unchecked'}
                                    </span>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-zinc-200 transition-colors ${
                                    role === 'vendor' 
                                        ? 'bg-white text-lime-600' 
                                        : 'bg-zinc-100 text-zinc-500 group-hover:text-lime-600'
                                }`}>
                                    <span className="material-symbols-outlined text-2xl">storefront</span>
                                </div>
                                <h3 className="font-headline text-[24px] font-semibold text-zinc-900 mb-2">Vendor Account</h3>
                                <p className="font-body text-[16px] text-zinc-600">Sell healthy products on the marketplace.</p>
                            </button>
                        </div>

                        <div className="mt-8">
                            <button 
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-lime-600/20 text-[14px] font-label"
                            >
                                Continue
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: BASIC IDENTITY */}
                {step === 2 && (
                    <div>
                        <div className="mb-8">
                            <span className="font-semibold text-[14px] text-lime-700 mb-2 block uppercase tracking-wider font-label">
                                Step 2 of {role === 'customer' ? '4' : '3'}
                            </span>
                            <h1 className="text-[32px] font-bold text-zinc-900 mb-2 tracking-tight font-headline">Create your account</h1>
                            <p className="text-[16px] text-zinc-500 font-body">Let's start with your basic details.</p>
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
                            {/* Full Name */}
                            <div>
                                <div className="relative group">
                                    <label className="sr-only" htmlFor="fullName">Full Name</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">person</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-[16px] text-zinc-900 placeholder-zinc-400 font-body ${
                                            touchedFields.fullName && !isFullNameValid ? 'border-red-300' : 'border-zinc-200'
                                        }`} 
                                        id="fullName" 
                                        name="fullName" 
                                        placeholder="John Doe" 
                                        required 
                                        type="text"
                                        value={fullName}
                                        onBlur={() => handleBlur('fullName')}
                                        onChange={e => setFullName(e.target.value)}
                                    />
                                </div>
                                {touchedFields.fullName && !isFullNameValid && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Full name is required (minimum 2 characters).
                                    </p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div>
                                <div className="relative group">
                                    <label className="sr-only" htmlFor="email">Email Address</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">mail</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-[16px] text-zinc-900 placeholder-zinc-400 font-body ${
                                            touchedFields.email && !isEmailValid ? 'border-red-300' : 'border-zinc-200'
                                        }`} 
                                        id="email" 
                                        name="email" 
                                        placeholder="john@example.com" 
                                        required 
                                        type="email"
                                        value={email}
                                        onBlur={() => handleBlur('email')}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                {touchedFields.email && !isEmailValid && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Please enter a valid email format.
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="relative group">
                                    <label className="sr-only" htmlFor="password">Password</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">lock</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-[16px] text-zinc-900 placeholder-zinc-400 font-body ${
                                            touchedFields.password && !isPasswordValid ? 'border-red-300' : 'border-zinc-200'
                                        }`} 
                                        id="password" 
                                        name="password" 
                                        placeholder="••••••••" 
                                        required 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onBlur={() => handleBlur('password')}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button 
                                        aria-label="Toggle password visibility" 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none" 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {touchedFields.password && !isPasswordValid ? (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Password must be between 6 and 20 characters.
                                    </p>
                                ) : (
                                    <p className="mt-2 text-[12px] text-zinc-500 ml-1 font-label">Must be between 6 and 20 characters.</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4">
                                <button 
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors focus:outline-none" 
                                    type="button"
                                >
                                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                                    Back
                                </button>

                                {isStep2Valid ? (
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-[14px] bg-lime-600 hover:bg-lime-700 text-white shadow-lg shadow-lime-600/20 transition-all focus:outline-none"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button 
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-[14px] bg-zinc-100 text-zinc-400 cursor-not-allowed transition-all" 
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

                {/* STEP 3: VENDOR PROFILE DETAILS */}
                {step === 3 && role === 'vendor' && (
                    <div>
                        <div className="mb-8">
                            <p className="text-[12px] text-lime-700 uppercase tracking-wider mb-2 font-semibold">STEP 3 OF 3</p>
                            <h1 className="text-[32px] font-bold text-zinc-800 mb-2 font-headline">Store Details</h1>
                            <p className="text-[16px] text-zinc-500 font-body">Set up your marketplace presence to start selling healthy products.</p>
                        </div>

                        <form onSubmit={onSubmitFinal} className="space-y-6">
                            {/* Store Name */}
                            <div>
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-2 font-label" htmlFor="store-name">Store Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                                        <span className="material-symbols-outlined text-lg">storefront</span>
                                    </div>
                                    <input 
                                        className={`w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-xl border text-zinc-800 placeholder:text-zinc-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[16px] font-body ${
                                            touchedFields.displayName && !isDisplayNameValid ? 'border-red-300' : 'border-zinc-200'
                                        }`} 
                                        id="store-name" 
                                        name="store-name" 
                                        placeholder="Nature's Harvest" 
                                        required 
                                        type="text"
                                        value={displayName}
                                        onBlur={() => handleBlur('displayName')}
                                        onChange={e => setDisplayName(e.target.value)}
                                    />
                                </div>
                                {touchedFields.displayName && !isDisplayNameValid && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Store name must be between 3 and 20 characters.
                                    </p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-2 font-label" htmlFor="bio">Short Bio (Optional)</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[16px] resize-none font-body" 
                                    id="bio" 
                                    name="bio" 
                                    placeholder="We sell 100% organic..." 
                                    rows="3"
                                    value={bio}
                                    onChange={e => setBio(e.target.value.substring(0, 500))}
                                />
                            </div>

                            {/* Business Phone Number */}
                            <div>
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-2 font-label" htmlFor="phone">Business Phone Number</label>
                                <div className="flex gap-2 mb-1">
                                    <div className="relative w-1/3">
                                        <select 
                                            value={countryCode} 
                                            onChange={e => setCountryCode(e.target.value)} 
                                            className="w-full pl-3 pr-10 py-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[14px] appearance-none font-body"
                                        >
                                            {COUNTRY_CODES.map(item => (
                                                <option key={item.code} value={item.code}>
                                                    {item.code}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
                                            <span className="material-symbols-outlined text-lg font-body">expand_more</span>
                                        </div>
                                    </div>

                                    <div className="relative w-2/3">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-body">
                                            <span className="material-symbols-outlined text-lg">call</span>
                                        </div>
                                        <input 
                                            className={`w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-xl border text-zinc-800 placeholder:text-zinc-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[16px] font-body ${
                                                touchedFields.phoneNumber && !isPhoneLengthValid ? 'border-red-300' : 'border-zinc-200'
                                            }`} 
                                            id="phone" 
                                            name="phone" 
                                            placeholder="123456789" 
                                            required 
                                            type="tel"
                                            value={phoneNumber}
                                            onBlur={() => handleBlur('phoneNumber')}
                                            onChange={e => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {touchedFields.phoneNumber && !isPhoneLengthValid ? (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Phone must be a valid numerical value between 8 and 15 digits (no leading zero).
                                    </p>
                                ) : (
                                    <p className="text-[12px] text-zinc-500 ml-1 font-label">Must enter the local number body (e.g. 779610317)</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
                                <div>
                                    <label className="block text-[14px] font-semibold text-zinc-800 mb-2 font-label" htmlFor="address">Street Address</label>
                                    <div className="relative font-body">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-body">
                                            <span className="material-symbols-outlined text-lg">location_on</span>
                                        </div>
                                        <input 
                                            className="w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[16px] font-body" 
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
                                    <label className="block text-[14px] font-semibold text-zinc-800 mb-2 font-label" htmlFor="wilaya">Wilaya (Province)</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full pl-4 pr-10 py-3 bg-zinc-100 rounded-xl border border-zinc-200 text-zinc-800 focus:border-lime-600 focus:ring-1 focus:ring-lime-600 focus:outline-none transition-shadow text-[16px] appearance-none font-body" 
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
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-zinc-400 font-body">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors && <div className="mt-4">{errors}</div>}

                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-200">
                                <button 
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                                    Back
                                </button>
                                
                                {isVendorFormValid ? (
                                    <button 
                                        type="submit" 
                                        className="flex items-center gap-2 px-6 py-3 bg-lime-600 text-white rounded-xl text-[14px] font-semibold hover:bg-lime-700 transition-colors shadow-sm focus:outline-none"
                                    >
                                        Create Vendor Account
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                ) : (
                                    <button 
                                        type="button" 
                                        disabled 
                                        className="flex items-center gap-2 px-6 py-3 bg-lime-600 text-white rounded-xl text-[14px] font-semibold opacity-50 cursor-not-allowed"
                                    >
                                        Create Vendor Account
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 3: CUSTOMER PHYSICAL PROFILE */}
                {step === 3 && role === 'customer' && (
                    <div>
                        <div className="mb-8 font-body">
                            <span className="block text-lime-700 font-semibold text-[14px] uppercase mb-2">STEP 3 OF 4</span>
                            <h1 className="text-[32px] font-bold text-zinc-800 mb-2 font-headline">Your Physical Profile</h1>
                            <p className="text-[16px] text-zinc-500 font-body">This helps our AI calculate your precise nutritional needs.</p>
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
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-1.5 font-label">Gender</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex items-center justify-center py-3 rounded-lg transition-colors focus:outline-none ${
                                            gender === 'male'
                                                ? 'border-2 border-lime-600 bg-lime-50 text-lime-700 font-semibold'
                                                : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                                        }`}
                                    >
                                        Male
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex items-center justify-center py-3 rounded-lg transition-colors focus:outline-none ${
                                            gender === 'female'
                                                ? 'border-2 border-lime-600 bg-lime-50 text-lime-700 font-semibold'
                                                : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                                        }`}
                                    >
                                        Female
                                    </button>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-1.5 font-label" htmlFor="dob">Date of Birth</label>
                                <input 
                                    className={`w-full bg-white border rounded-lg px-4 py-3 text-[16px] text-zinc-800 focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors font-body ${
                                        touchedFields.dob && !isDOBValid ? 'border-red-300' : 'border-zinc-200'
                                    }`} 
                                    id="dob" 
                                    type="date"
                                    max={todayStr}
                                    required
                                    value={dateOfBirth}
                                    onBlur={() => handleBlur('dob')}
                                    onChange={e => setDateOfBirth(e.target.value)}
                                />
                                {touchedFields.dob && !isDOBValid && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Date of birth cannot be in the future.
                                    </p>
                                )}
                            </div>

                            {/* Height & Weight */}
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-[14px] font-semibold text-zinc-800 mb-1.5 font-label" htmlFor="height">Height</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className={`w-full bg-white border rounded-lg pl-4 pr-12 py-3 text-[16px] text-zinc-800 focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors appearance-none font-body ${
                                                touchedFields.height && !isHeightValid ? 'border-red-300' : 'border-zinc-200'
                                            }`} 
                                            id="height" 
                                            placeholder="175" 
                                            type="number"
                                            min="50"
                                            max="250"
                                            step="any"
                                            required
                                            value={heightCM}
                                            onBlur={() => handleBlur('height')}
                                            onChange={e => setHeightCM(e.target.value)}
                                        />
                                        <span className="absolute right-4 text-[16px] text-zinc-500 pointer-events-none font-body">cm</span>
                                    </div>
                                    {touchedFields.height && !isHeightValid && (
                                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span> Must be 50-250 cm.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[14px] font-semibold text-zinc-800 mb-1.5 font-label" htmlFor="weight">Weight</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className={`w-full bg-white border rounded-lg pl-4 pr-12 py-3 text-[16px] text-zinc-800 focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors appearance-none font-body ${
                                                touchedFields.weight && !isWeightValid ? 'border-red-300' : 'border-zinc-200'
                                            }`} 
                                            id="weight" 
                                            placeholder="70" 
                                            type="number"
                                            min="30"
                                            max="300"
                                            step="any"
                                            required
                                            value={weightKG}
                                            onBlur={() => handleBlur('weight')}
                                            onChange={e => setWeightKG(e.target.value)}
                                        />
                                        <span className="absolute right-4 text-[16px] text-zinc-500 pointer-events-none font-body">kg</span>
                                    </div>
                                    {touchedFields.weight && !isWeightValid && (
                                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span> Must be 30-300 kg.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Activity Level */}
                            <div>
                                <label className="block text-[14px] font-semibold text-zinc-800 mb-1.5 font-label" htmlFor="activity">Activity Level</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-[16px] text-zinc-800 focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors appearance-none pr-10 font-body" 
                                        id="activity"
                                        value={activityLevel}
                                        onChange={e => setActivityLevel(e.target.value)}
                                    >
                                        <option value="" disabled>Select Activity Level</option>
                                        <option value="sedentary">Sedentary</option>
                                        <option value="lightly_active">Lightly Active</option>
                                        <option value="moderately_active">Moderately Active</option>
                                        <option value="active">Active</option>
                                        <option value="very_active">Very Active</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none">arrow_drop_down</span>
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between items-center">
                                <button 
                                    type="button" 
                                    onClick={handleBack}
                                    className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors font-semibold text-[14px] px-4 py-2 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined mr-2 text-[20px]">arrow_back</span>
                                    Back
                                </button>
                                
                                {isCustomerStep3Valid ? (
                                    <button 
                                        type="submit"
                                        className="flex items-center bg-lime-600 text-white hover:bg-lime-700 transition-colors font-semibold text-[14px] px-6 py-3 rounded-lg shadow-sm focus:outline-none"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        disabled
                                        className="flex items-center bg-zinc-100 text-zinc-400 opacity-50 cursor-not-allowed font-semibold text-[14px] px-6 py-3 rounded-lg"
                                    >
                                        Continue
                                        <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 4: CUSTOMER HEALTH GOALS & CONDITIONS */}
                {step === 4 && role === 'customer' && (
                    <div>
                        <header className="mb-10 text-center font-body">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <span className="text-[12px] font-semibold text-lime-700 tracking-widest uppercase font-label">Step 4 of 4</span>
                            </div>
                            <h1 className="text-[32px] font-bold text-zinc-900 mb-3 font-headline">Your Health Goals</h1>
                            <p className="text-[16px] text-zinc-500 font-body max-w-md mx-auto">
                                Tell us what you want to achieve and any dietary restrictions to tailor your experience.
                            </p>
                        </header>

                        <form onSubmit={onSubmitFinal} className="space-y-10">
                            <section>
                                <h2 className="text-[24px] font-semibold text-zinc-900 mb-4 font-headline">What is your main goal?</h2>
                                <div className="flex flex-wrap gap-3 font-label">
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
                                            className={`px-6 py-3 rounded-full font-semibold text-[14px] transition-all shadow-sm focus:outline-none ${
                                                primaryHealthGoal === goal.id
                                                    ? 'bg-lime-600 text-white'
                                                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                            }`}
                                        >
                                            {goal.name}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <hr className="border-zinc-200 opacity-50" />

                            <section>
                                <h2 className="text-[24px] font-semibold text-zinc-900 mb-2 font-headline">Medical Conditions</h2>
                                <p className="text-[16px] text-zinc-500 mb-4 font-body">Select all that apply</p>
                                <div className="flex flex-wrap gap-3 font-label">
                                    {MEDICAL_CONDITIONS.map((condition) => {
                                        const isSelected = medicalCondition.includes(condition.value);
                                        return (
                                            <button 
                                                key={condition.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(condition.value, setMedicalCondition, medicalCondition)}
                                                disabled={medicalCondition.includes('none') && condition.value !== 'none'}
                                                className={`px-4 py-2 rounded-lg border font-semibold text-[14px] transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-red-300 bg-red-100 text-red-700'
                                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-lime-700 hover:text-lime-700 disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                                {condition.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <hr className="border-zinc-200 opacity-50" />

                            <section>
                                <h2 className="text-[24px] font-semibold text-zinc-900 mb-4 font-headline">Allergies &amp; Intolerances</h2>
                                <div className="flex flex-wrap gap-3 font-label">
                                    {ALLERGIES.map((allergen) => {
                                        const isSelected = allergy.includes(allergen.value);
                                        return (
                                            <button 
                                                key={allergen.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(allergen.value, setAllergy, allergy)}
                                                disabled={allergy.includes('none') && allergen.value !== 'none'}
                                                className={`px-4 py-2 rounded-lg border font-semibold text-[14px] transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-[#f59e0b] bg-[#fef3c7] text-[#92400e]'
                                                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-lime-700 hover:text-lime-700 disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[18px]">check</span>}
                                                {allergen.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {errors && <div className="mt-4">{errors}</div>}

                            <div className="mt-12 flex items-center justify-between pt-6 border-t border-zinc-200">
                                <button 
                                    type="button"
                                    onClick={handleBack}
                                    className="flex items-center gap-2 text-zinc-500 hover:text-lime-700 font-semibold text-[14px] transition-colors px-4 py-2 rounded-lg hover:bg-zinc-100 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined">arrow_left</span>
                                    Back
                                </button>
                                
                                {isCustomerStep4Valid ? (
                                    <button 
                                        type="submit"
                                        className="flex items-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold text-[14px] px-8 py-4 rounded-xl shadow-[0_8px_16px_-4px_rgba(34,197,94,0.3)] hover:-translate-y-0.5 transition-all focus:outline-none"
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                        Create Account
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        disabled
                                        className="flex items-center gap-2 bg-zinc-100 text-zinc-400 font-semibold text-[14px] px-8 py-4 rounded-xl opacity-50 cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined">check</span>
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {step !== 3 && step !== 4 && errors && (
                    <div className="mt-6">{errors}</div>
                )}

            </main>
        </div>
    );
}