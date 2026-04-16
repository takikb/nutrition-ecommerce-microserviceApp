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

    // Identity Data
    const [email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const[role, setRole] = useState('customer');

    // Customer Data
    const [gender, setGender] = useState('male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const[heightCM, setHeightCM] = useState('');
    const [weightKG, setWeightKG] = useState('');
    const [activityLevel, setActivityLevel] = useState('');
    const[primaryHealthGoal, setPrimaryHealthGoal] = useState('');
    const [medicalCondition, setMedicalCondition] = useState([]);
    const [allergy, setAllergy] = useState([]);

    // Vendor Data
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

    const onNextStep = (event) => {
        event.preventDefault();
        setStep(2);
    };

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
        <div className="container mt-5">
            {step === 1 && (
                <form onSubmit={onNextStep}>
                    <h1>Step 1: Create Account</h1>
                    
                    <div className="form-group">
                        <label>Full Name</label>
                        <input value={fullName} onChange={e => setFullName(e.target.value)} className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Email Address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type='email' className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Password</label>
                        <input value={password} onChange={e => setPassword(e.target.value)} type='password' className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)} className='form-control'>
                            <option value='customer'>Customer</option>
                            <option value='vendor'>Vendor</option>
                        </select>
                    </div>

                    <button className='btn btn-primary mt-4'>Next Step</button>
                </form>
            )}

            {step === 2 && role === 'customer' && (
                <form onSubmit={onSubmitFinal}>
                    <h1>Step 2: Customer Profile</h1>
                    
                    <div className="form-group mt-2">
                        <label>Gender</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} className='form-control'>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                        </select>
                    </div>
                    <div className="form-group mt-2">
                        <label>Date of Birth</label>
                        <input value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} type='date' className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Height (cm)</label>
                        <input value={heightCM} onChange={e => setHeightCM(e.target.value)} type='number' className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Weight (kg)</label>
                        <input value={weightKG} onChange={e => setWeightKG(e.target.value)} type='number' className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Activity Level</label>
                        <select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className='form-control'>
                            <option value=''>Select Activity Level</option>
                            <option value='sedentary'>Sedentary</option>
                            <option value='lightly_active'>Lightly Active</option>
                            <option value='moderately_active'>Moderately Active</option>
                            <option value='active'>Active</option>
                            <option value='very_active'>Very Active</option>
                        </select>
                    </div>
                    <div className="form-group mt-2">
                        <label>Primary Health Goal</label>
                        <select value={primaryHealthGoal} onChange={e => setPrimaryHealthGoal(e.target.value)} className='form-control'>
                            <option value=''>Select Health Goal</option>
                            <option value='weight_loss'>Weight Loss</option>
                            <option value='muscle_gain'>Muscle Gain</option>
                            <option value='maintenance'>Maintenance</option>
                            <option value='improved_energy'>Improved Energy</option>
                        </select>
                    </div>

                    <div className="form-group mt-2">
                        <label>Medical Conditions</label>
                        <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {MEDICAL_CONDITIONS.map(condition => (
                                <div key={condition.value} className="form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id={`condition-${condition.value}`}
                                        checked={medicalCondition.includes(condition.value)}
                                        onChange={() => handleCheckboxChange(condition.value, setMedicalCondition, medicalCondition)}
                                        disabled={medicalCondition.includes('none') && condition.value !== 'none'}
                                    />
                                    <label className="form-check-label" htmlFor={`condition-${condition.value}`}>
                                        {condition.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="form-group mt-2">
                        <label>Allergies</label>
                        <div className="border p-3 rounded" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {ALLERGIES.map(allergen => (
                                <div key={allergen.value} className="form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id={`allergy-${allergen.value}`}
                                        checked={allergy.includes(allergen.value)}
                                        onChange={() => handleCheckboxChange(allergen.value, setAllergy, allergy)}
                                        disabled={allergy.includes('none') && allergen.value !== 'none'}
                                    />
                                    <label className="form-check-label" htmlFor={`allergy-${allergen.value}`}>
                                        {allergen.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {errors}
                    
                    <div className="mt-4">
                        <button type="button" onClick={() => setStep(1)} className='btn btn-secondary mr-2'>Back</button>
                        <button type="submit" className='btn btn-success'>Complete Sign Up</button>
                    </div>
                </form>
            )}

            {step === 2 && role === 'vendor' && (
                <form onSubmit={onSubmitFinal}>
                    <h1>Step 2: Vendor Profile</h1>
                    
                    <div className="form-group mt-2">
                        <label>Store/Display Name</label>
                        <input value={displayName} onChange={e => setDisplayName(e.target.value)} className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Bio (Optional)</label>
                        <textarea 
                            value={bio} 
                            onChange={e => setBio(e.target.value.substring(0, 500))} 
                            className='form-control' 
                            maxLength='500'
                            placeholder='Tell us about your store...'
                            rows='4'
                        />
                        <small className='form-text text-muted'>{bio.length}/500 characters</small>
                    </div>
                    <div className="form-group mt-2">
                        <label>Phone Number</label>
                        <div className="input-group">
                            <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className='form-control' style={{ maxWidth: '150px' }}>
                                {COUNTRY_CODES.map(item => (
                                    <option key={item.code} value={item.code}>{item.code} {item.country}</option>
                                ))}
                            </select>
                            <input 
                                value={phoneNumber} 
                                onChange={e => setPhoneNumber(e.target.value)} 
                                type='tel'
                                placeholder='123456789'
                                className='form-control' 
                                required 
                            />
                        </div>
                    </div>
                    <div className="form-group mt-2">
                        <label>Address</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} className='form-control' required />
                    </div>
                    <div className="form-group mt-2">
                        <label>Wilaya</label>
                        <input value={wilaya} onChange={e => setWilaya(e.target.value)} className='form-control' required />
                    </div>

                    {errors}
                    
                    <div className="mt-4">
                        <button type="button" onClick={() => setStep(1)} className='btn btn-secondary mr-2'>Back</button>
                        <button type="submit" className='btn btn-success'>Complete Sign Up</button>
                    </div>
                </form>
            )}
        </div>
    );
}