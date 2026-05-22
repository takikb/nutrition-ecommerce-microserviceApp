import { useState } from "react";
import Router from "next/router";
import Link from "next/link";
import useRequest from "../../hooks/use-request";

// Matches your backend ProductCategory enum values
const CATEGORIES = [
    { value: 'meals', label: 'Prepared Meals' },
    { value: 'snacks', label: 'Healthy Snacks' },
    { value: 'beverages', label: 'Organic Beverages' },
    { value: 'supplements', label: 'Supplements' },
    { value: 'produce', label: 'Fresh Produce' }
];

// Matches your backend Allergy enum values
const ALLERGY_OPTIONS = [
    { value: 'lactose', label: 'Lactose' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'none', label: 'None' }
];

// Matches your backend MedicalCondition enum values
const MEDICAL_CONDITION_OPTIONS = [
    { value: 'diabetes_type_1', label: 'Type 1 Diabetes' },
    { value: 'diabetes_type_2', label: 'Type 2 Diabetes' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'high_cholesterol', label: 'High Cholesterol' },
    { value: 'celiac_disease', label: 'Celiac Disease' },
    { value: 'ibs', label: 'IBS' },
    { value: 'anemia', label: 'Anemia' },
    { value: 'thyroid_disorder', label: 'Thyroid Disorder' },
    { value: 'pcos', label: 'PCOS' },
    { value: 'none', label: 'None' }
];

export default function NewProduct() {
    // Form fields mapped to backend validation schema
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceDZD, setPriceDZD] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [nutritionTableImage, setNutritionTableImage] = useState('');
    const [calories, setCalories] = useState('');
    const [proteinGrams, setProteinGrams] = useState('');
    const [carbsGrams, setCarbsGrams] = useState('');
    const [fatGrams, setFatGrams] = useState('');
    const [containsAllergens, setContainsAllergens] = useState([]);
    const [MedicalCondition, setMedicalCondition] = useState([]); // Capitalized matching validator check

    const { doRequest, errors } = useRequest({
        url: '/api/products',
        method: 'post',
        onSuccess: () => Router.push('/') // Redirect on success
    });

    const handleCheckboxChange = (value, setState, currentState) => {
        if (value === 'none') {
            if (currentState.includes('none')) {
                setState([]);
            } else {
                setState(['none']);
            }
        } else {
            let updatedState = currentState.filter(item => item !== 'none');
            if (updatedState.includes(value)) {
                setState(updatedState.filter(item => item !== value));
            } else {
                setState([...updatedState, value]);
            }
        }
    };

    const handleAddImage = (e) => {
        e.preventDefault();
        const trimmed = newImageUrl.trim();
        if (trimmed && !images.includes(trimmed)) {
            setImages([...images, trimmed]);
            setNewImageUrl('');
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    // Client-side input validation mapping to express-validator checks
    const parsedPrice = parseFloat(priceDZD);
    const parsedCalories = parseFloat(calories);
    const parsedProtein = parseFloat(proteinGrams);
    const parsedCarbs = parseFloat(carbsGrams);
    const parsedFat = parseFloat(fatGrams);

    const isPriceValid = !isNaN(parsedPrice) && parsedPrice > 0;
    const isCaloriesValid = !isNaN(parsedCalories) && parsedCalories > 0 && parsedCalories < 10000;
    const isProteinValid = !isNaN(parsedProtein) && parsedProtein > 0 && parsedProtein < 1000;
    const isCarbsValid = !isNaN(parsedCarbs) && parsedCarbs > 0 && parsedCarbs < 1000;
    const isFatValid = !isNaN(parsedFat) && parsedFat > 0 && parsedFat < 1000;

    const isFormValid = 
        title.trim() !== "" &&
        description.trim().length >= 10 && description.trim().length <= 500 &&
        isPriceValid &&
        category !== "" &&
        images.length >= 1 &&
        nutritionTableImage.trim() !== "" &&
        isCaloriesValid &&
        isProteinValid &&
        isCarbsValid &&
        isFatValid;

    const onSubmitFinal = async (event) => {
        event.preventDefault();
        if (!isFormValid) return;

        await doRequest({
            title: title.trim(),
            description: description.trim(),
            priceDZD: parsedPrice,
            category,
            images,
            nutritionTableImage: nutritionTableImage.trim(),
            calories: parsedCalories,
            proteinGrams: parsedProtein,
            carbsGrams: parsedCarbs,
            fatGrams: parsedFat,
            containsAllergens: containsAllergens.length > 0 ? containsAllergens : ['none'],
            MedicalCondition: MedicalCondition.length > 0 ? MedicalCondition : ['none']
        });
    };

    return (
        <div className="bg-background min-h-screen py-10 px-4 md:px-6 flex justify-center text-on-surface font-sans">
            <div className="w-full max-w-3xl flex flex-col gap-6">
                
                {/* Dashboard Back Nav */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Back to Catalog
                    </Link>
                </div>

                {/* Card Wrapper */}
                <main className="bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/30 p-6 md:p-10">
                    
                    {/* Header */}
                    <header className="mb-8 pb-6 border-b border-outline-variant/20">
                        <span className="block text-primary text-xs font-semibold uppercase tracking-wider mb-2">Inventory Management</span>
                        <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Create New Product</h1>
                        <p className="text-sm text-on-surface-variant">Provide standard metadata, nutritional profiles, and allergen safety tags.</p>
                    </header>

                    <form onSubmit={onSubmitFinal} className="space-y-8">
                        
                        {/* ================= SECTION 1: GENERAL METADATA ================= */}
                        <section className="space-y-5">
                            <h2 className="text-lg font-bold text-on-surface pb-1 border-b border-outline-variant/10">1. General Information</h2>
                            
                            {/* Product Title */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-on-surface" htmlFor="title">Product Name</label>
                                <input 
                                    className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                    id="title" 
                                    placeholder="Organic Avocado Mash" 
                                    required 
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Category & Price DZD */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-on-surface" htmlFor="category">Category</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full pl-4 pr-10 py-3 bg-surface rounded-xl border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm appearance-none" 
                                            id="category"
                                            required
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                        >
                                            <option value="" disabled>Select Product Category</option>
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-outline">
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-on-surface" htmlFor="price">Price (DZD)</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full pl-4 pr-16 py-3 bg-surface border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none text-sm" 
                                            id="price" 
                                            placeholder="850" 
                                            type="number"
                                            step="0.01"
                                            required
                                            value={priceDZD}
                                            onChange={e => setPriceDZD(e.target.value)}
                                        />
                                        <span className="absolute right-4 text-xs text-on-surface-variant font-bold pointer-events-none">DZD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Description */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-on-surface" htmlFor="description">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm resize-none" 
                                    id="description" 
                                    placeholder="Detail ingredients, organic certifications, and preparation style..." 
                                    rows="3"
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value.substring(0, 500))}
                                />
                                <div className="flex justify-between text-xs text-on-surface-variant px-1">
                                    <span>Must be between 10 and 500 characters.</span>
                                    <span>{description.length}/500</span>
                                </div>
                            </div>
                        </section>

                        {/* ================= SECTION 2: GALLERY & VISUALS ================= */}
                        <section className="space-y-5">
                            <h2 className="text-lg font-bold text-on-surface pb-1 border-b border-outline-variant/10">2. Media & Visuals</h2>
                            
                            {/* Images Array Builder */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-on-surface" htmlFor="new-image">Product Image URLs</label>
                                <div className="flex gap-2">
                                    <input 
                                        className="w-full px-4 py-3 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                        id="new-image" 
                                        placeholder="https://example.com/product-image.png" 
                                        type="url"
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddImage}
                                        className="px-5 bg-primary text-on-primary hover:bg-secondary rounded-xl text-sm font-semibold transition-colors focus:outline-none"
                                    >
                                        Add
                                    </button>
                                </div>
                                <p className="text-xs text-on-surface-variant ml-1">Must add at least 1 image URL.</p>

                                {/* Interactive Preview Cards List */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                        {images.map((url, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs">
                                                <span className="truncate max-w-[200px] font-semibold text-on-surface-variant">{url}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="text-red-600 hover:text-red-800 font-bold flex items-center justify-center p-1 rounded-lg hover:bg-red-50 focus:outline-none"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Nutrition Table Image */}
                            <div className="space-y-1.5 pt-2">
                                <label className="block text-sm font-semibold text-on-surface" htmlFor="nutrition-image">Nutrition Table Image URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                                        <span className="material-symbols-outlined text-lg">fact_sheet</span>
                                    </div>
                                    <input 
                                        className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border border-outline-variant text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow text-sm" 
                                        id="nutrition-image" 
                                        placeholder="https://example.com/nutrition-label.png" 
                                        required 
                                        type="url"
                                        value={nutritionTableImage}
                                        onChange={e => setNutritionTableImage(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ================= SECTION 3: NUTRITIONAL PROFILE ================= */}
                        <section className="space-y-5">
                            <h2 className="text-lg font-bold text-on-surface pb-1 border-b border-outline-variant/10">3. Nutritional Value (per serving)</h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
                                {/* Calories */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-on-surface-variant" htmlFor="calories">Calories</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant text-on-surface focus:outline-none text-sm font-semibold" 
                                            id="calories" 
                                            placeholder="350" 
                                            required 
                                            type="number"
                                            value={calories}
                                            onChange={e => setCalories(e.target.value)}
                                        />
                                        <span className="absolute right-3 text-[10px] text-outline font-bold">kcal</span>
                                    </div>
                                </div>

                                {/* Protein */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-on-surface-variant" htmlFor="protein">Protein</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant text-on-surface focus:outline-none text-sm font-semibold" 
                                            id="protein" 
                                            placeholder="12" 
                                            required 
                                            type="number"
                                            value={proteinGrams}
                                            onChange={e => setProteinGrams(e.target.value)}
                                        />
                                        <span className="absolute right-3 text-[10px] text-outline font-bold">g</span>
                                    </div>
                                </div>

                                {/* Carbs */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-on-surface-variant" htmlFor="carbs">Carbohydrates</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant text-on-surface focus:outline-none text-sm font-semibold" 
                                            id="carbs" 
                                            placeholder="45" 
                                            required 
                                            type="number"
                                            value={carbsGrams}
                                            onChange={e => setCarbsGrams(e.target.value)}
                                        />
                                        <span className="absolute right-3 text-[10px] text-outline font-bold">g</span>
                                    </div>
                                </div>

                                {/* Fats */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-on-surface-variant" htmlFor="fat">Fat</label>
                                    <div className="relative flex items-center">
                                        <input 
                                            className="w-full px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant text-on-surface focus:outline-none text-sm font-semibold" 
                                            id="fat" 
                                            placeholder="8" 
                                            required 
                                            type="number"
                                            value={fatGrams}
                                            onChange={e => setFatGrams(e.target.value)}
                                        />
                                        <span className="absolute right-3 text-[10px] text-outline font-bold">g</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================= SECTION 4: DIETARY SAFETY TAGS ================= */}
                        <section className="space-y-5">
                            <h2 className="text-lg font-bold text-on-surface pb-1 border-b border-outline-variant/10">4. Dietary Safety Tags</h2>
                            
                            {/* Suitability suitable for conditions */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-on-surface">Medical Suitability</h3>
                                <p className="text-xs text-on-surface-variant mb-2">Select suitabilities matching this recipe profile (choose None if not verified):</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {MEDICAL_CONDITION_OPTIONS.map((condition) => {
                                        const isSelected = MedicalCondition.includes(condition.value);
                                        return (
                                            <button 
                                                key={condition.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(condition.value, setMedicalCondition, MedicalCondition)}
                                                disabled={MedicalCondition.includes('none') && condition.value !== 'none'}
                                                className={`px-3.5 py-2 rounded-lg border font-semibold text-xs transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-tertiary bg-error-container text-on-error-container'
                                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                                                {condition.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contains Allergens check */}
                            <div className="space-y-2 pt-4">
                                <h3 className="text-sm font-bold text-on-surface">Allergens Contained</h3>
                                <p className="text-xs text-on-surface-variant mb-2">Identify if this product triggers any allergy risks (choose None for clean recipes):</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {ALLERGY_OPTIONS.map((allergen) => {
                                        const isSelected = containsAllergens.includes(allergen.value);
                                        return (
                                            <button 
                                                key={allergen.value}
                                                type="button"
                                                onClick={() => handleCheckboxChange(allergen.value, setContainsAllergens, containsAllergens)}
                                                disabled={containsAllergens.includes('none') && allergen.value !== 'none'}
                                                className={`px-3.5 py-2 rounded-lg border font-semibold text-xs transition-all flex items-center gap-2 focus:outline-none ${
                                                    isSelected
                                                        ? 'border-[#f59e0b] bg-[#fef3c7] text-[#92400e]'
                                                        : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed'
                                                }`}
                                            >
                                                {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                                                {allergen.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Error Alerts */}
                        {errors && <div className="pt-2">{errors}</div>}

                        {/* Submission Buttons */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-outline-variant/30">
                            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                                Cancel
                            </Link>
                            
                            {isFormValid ? (
                                <button 
                                    type="submit"
                                    className="flex items-center gap-2 bg-primary hover:bg-secondary text-on-primary font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
                                >
                                    Create Product
                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    disabled
                                    className="flex items-center gap-2 bg-surface-variant text-outline-variant font-semibold text-sm px-8 py-3.5 rounded-xl cursor-not-allowed opacity-50"
                                >
                                    Create Product
                                    <span className="material-symbols-outlined text-[20px]">check</span>
                                </button>
                            )}
                        </div>

                    </form>
                </main>
            </div>
        </div>
    );
}