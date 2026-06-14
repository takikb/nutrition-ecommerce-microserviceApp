import { useState, useRef } from "react";
import Router from "next/router";
import Link from "next/link";
import axios from "axios"; 
import useRequest from "../../hooks/use-request";
import buildClient from "../../api/build-client";

const CLOUDINARY_CLOUD_NAME = "dsjhb76ja"; 
const CLOUDINARY_UPLOAD_PRESET = "d-ziet_preset"; 

const CATEGORY_OPTIONS = [
    { value: 'meal_prep', label: 'Meal Prep' },
    { value: 'snack', label: 'Snack' },
    { value: 'supplement', label: 'Supplement' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'drink', label: 'Drink' }
];

const ALLERGEN_OPTIONS = [
    { value: 'lactose', label: 'Lactose' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'peanuts', label: 'Peanuts' },
    { value: 'tree_nuts', label: 'Tree Nuts' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'fish', label: 'Fish' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'strawberry', label: 'Strawberry' }
];

export default function VendorProducts({ initialProducts, currentUser }) {
    const [listings, setListings] = useState(initialProducts || []);
    const [isUploading, setIsUploading] = useState(false); 
    const [touchedFields, setTouchedFields] = useState({});

    // Selected Product tracking for Edit Mode [4]
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Form Field States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceDZD, setPriceDZD] = useState('');
    const [category, setCategory] = useState('');
    const [images, setImages] = useState([]); 
    const [nutritionTableImage, setNutritionTableImage] = useState('');
    const [calories, setCalories] = useState('');
    const [proteinGrams, setProteinGrams] = useState('');
    const [carbsGrams, setCarbsGrams] = useState('');
    const [fatGrams, setFatGrams] = useState('');
    const [containsAllergens, setContainsAllergens] = useState([]);

    const productImagesInputRef = useRef(null);
    const nutritionImageInputRef = useRef(null);

    // Create Request Hook
    const { doRequest, errors: creationErrors } = useRequest({
        url: '/api/products',
        method: 'post',
        onSuccess: (newProduct) => {
            setListings(prev => [newProduct, ...prev]);
            handleClearSelection();
        }
    });

    const handleBlur = (fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    };

    const handleAllergenToggle = (allergenValue) => {
        handleBlur('containsAllergens');
        if (containsAllergens.includes(allergenValue)) {
            setContainsAllergens(prev => prev.filter(item => item !== allergenValue));
        } else {
            setContainsAllergens(prev => [...prev, allergenValue]);
        }
    };

    const handleRemoveProductImage = (indexToRemove, event) => {
        event.stopPropagation();
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
        if (productImagesInputRef.current) productImagesInputRef.current.value = "";
    };

    const handleClearNutritionImage = (event) => {
        event.stopPropagation();
        setNutritionTableImage('');
        if (nutritionImageInputRef.current) nutritionImageInputRef.current.value = "";
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData
        );
        return response.data.secure_url;
    };

    const handleFileChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(file);
            if (type === 'product') {
                setImages(prev => [...prev, uploadedUrl]); 
                handleBlur('images');
            } else if (type === 'nutrition') {
                setNutritionTableImage(uploadedUrl); 
                handleBlur('nutritionTableImage');
            }
        } catch (err) {
            console.error(err);
            alert("Image upload failed. Please verify your Cloudinary configurations.");
        } finally {
            setIsUploading(false);
        }
    };

    // Card Selection Handlers [4]
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setSubmitError(null);
        setTitle(product.title);
        setDescription(product.description);
        setPriceDZD(product.priceDZD.toString());
        setCategory(product.category);
        setImages(product.images || []);
        setNutritionTableImage(product.nutritionTableImage);
        setCalories(product.calories.toString());
        setProteinGrams(product.proteinGrams.toString());
        setCarbsGrams(product.carbsGrams.toString());
        setFatGrams(product.fatGrams.toString());
        setContainsAllergens(product.containsAllergens || []);
        setTouchedFields({});
    };

    const handleClearSelection = () => {
        setSelectedProduct(null);
        setSubmitError(null);
        setTitle('');
        setDescription('');
        setPriceDZD('');
        setCategory('');
        setImages([]);
        setNutritionTableImage('');
        setCalories('');
        setProteinGrams('');
        setCarbsGrams('');
        setFatGrams('');
        setContainsAllergens([]);
        setTouchedFields({});
        if (productImagesInputRef.current) productImagesInputRef.current.value = "";
        if (nutritionImageInputRef.current) nutritionImageInputRef.current.value = "";
    };

    // Strict numerical boundary assertions
    const parsedPrice = parseFloat(priceDZD);
    const parsedCalories = parseFloat(calories);
    const parsedProtein = parseFloat(proteinGrams);
    const parsedCarbs = parseFloat(carbsGrams);
    const parsedFats = parseFloat(fatGrams);

    const isTitleValid = title.trim() !== "";
    const isDescriptionValid = description.trim().length >= 10 && description.trim().length <= 500;
    const isPriceValid = !isNaN(parsedPrice) && parsedPrice > 0;
    const isCategoryValid = category !== "";
    const isImagesValid = images.length > 0;
    const isNutritionValid = nutritionTableImage !== "";
    const isCaloriesValid = !isNaN(parsedCalories) && parsedCalories > 0 && parsedCalories < 10000;
    const isProteinValid = !isNaN(parsedProtein) && parsedProtein > 0 && parsedProtein < 1000;
    const isCarbsValid = !isNaN(parsedCarbs) && parsedCarbs > 0 && parsedCarbs < 1000;
    const isFatsValid = !isNaN(parsedFats) && parsedFats > 0 && parsedFats < 1000;

    const isFormValid = 
        isTitleValid && isDescriptionValid && isPriceValid && isCategoryValid && 
        isImagesValid && isNutritionValid && isCaloriesValid && isProteinValid && 
        isCarbsValid && isFatsValid;

    // Submit handler supporting both Create and Edit flows [4]
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        
        if (!isFormValid || isUploading) {
            setTouchedFields({
                title: true, description: true, priceDZD: true, category: true,
                images: true, nutritionTableImage: true, calories: true,
                proteinGrams: true, carbsGrams: true, fatGrams: true
            });
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim(),
            priceDZD: parsedPrice,
            category,
            images,
            nutritionTableImage,
            calories: parsedCalories,
            proteinGrams: parsedProtein,
            carbsGrams: parsedCarbs,
            fatGrams: parsedFats,
            containsAllergens: containsAllergens.length > 0 ? containsAllergens : ['none']
        };

        if (selectedProduct) {
            // EDIT FLOW
            setUpdating(true);
            setSubmitError(null);
            const selectedId = selectedProduct.id || selectedProduct._id;

            try {
                const { data } = await axios.put(`/api/products/${selectedId}`, payload);

                // Update the state list locally [4]
                setListings(prev => prev.map(p => {
                    const pid = p.id || p._id;
                    if (pid === selectedId) {
                        return data;
                    }
                    return p;
                }));

                handleClearSelection();
            } catch (err) {
                const errors = err.response?.data?.errors;
                if (errors && Array.isArray(errors)) {
                    setSubmitError(
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm space-y-1">
                            {errors.map((e, idx) => (
                                <p key={idx} className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">error</span> {e.message}
                                </p>
                            ))}
                        </div>
                    );
                } else {
                    setSubmitError(
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">error</span> Something went wrong.
                        </div>
                    );
                }
            } finally {
                setUpdating(false);
            }
        } else {
            // CREATE FLOW
            await doRequest(payload);
        }
    };

    return (
        <div className="bg-orange-50/50 min-h-screen text-zinc-800 antialiased font-sans selection:bg-lime-200">
            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Active Listings */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold font-headline text-zinc-800">Your Products</h2>
                            <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-bold select-none">
                                {listings.length} {listings.length === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {listings.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-sm text-center select-none">
                                    <span className="material-symbols-outlined text-zinc-300 text-5xl mb-3">inventory_2</span>
                                    <p className="text-zinc-500 font-medium text-sm">No products listed yet. Use the form to publish your first active listing.</p>
                                </div>
                            ) : (
                                listings.map((item) => {
                                    const pid = item.id || item._id;
                                    const isSelected = selectedProduct && (selectedProduct.id || selectedProduct._id) === pid;

                                    return (
                                        <div 
                                            key={pid} 
                                            onClick={() => handleSelectProduct(item)}
                                            className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all group flex items-start gap-4 relative cursor-pointer ${
                                                isSelected ? 'border-lime-500 ring-2 ring-lime-600/10' : 'border-zinc-100'
                                            }`}
                                        >
                                            {/* Dynamic Status Badges [4] */}
                                            {item.verificationStatus === 'approved' && (
                                                <span className="absolute top-4 right-4 bg-lime-50 text-lime-700 border border-lime-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none flex items-center gap-1 z-10">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Approved
                                                </span>
                                            )}
                                            {item.verificationStatus === 'pending' && (
                                                <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none flex items-center gap-1 z-10">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span> Pending
                                                </span>
                                            )}
                                            {item.verificationStatus === 'rejected' && (
                                                <span className="absolute top-4 right-4 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider select-none flex items-center gap-1 z-10">
                                                    <span className="material-symbols-outlined text-[14px]">cancel</span> Rejected
                                                </span>
                                            )}

                                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-100 flex-shrink-0 relative border border-zinc-200">
                                                <img 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                    src={item.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300"}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-24">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-zinc-800 text-lg truncate">{item.title}</h3>
                                                </div>
                                                <p className="text-lime-700 font-semibold mt-1">{item.priceDZD} DZD</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px] text-zinc-400">local_fire_department</span> 
                                                        {item.calories} kcal
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-semibold rounded-lg">
                                                        {item.proteinGrams}g P
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-semibold rounded-lg">
                                                        {item.carbsGrams}g C
                                                    </span>
                                                    <span className="px-2.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-semibold rounded-lg">
                                                        {item.fatGrams}g F
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Listing Entry & Review Form [4] */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-zinc-100 relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-lime-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-bold font-headline text-zinc-800 mb-2">
                                        {selectedProduct ? "Review & Edit Product" : "List a New Product"}
                                    </h2>
                                    <p className="text-zinc-500 font-medium text-sm">
                                        {selectedProduct ? "Modify your details. Any edit puts the listing back to pending review." : "Add nutritional details to help our AI recommend your product."}
                                    </p>
                                </div>
                                
                                {/* Cancel edit mode back trigger [4] */}
                                {selectedProduct && (
                                    <button 
                                        type="button" 
                                        onClick={handleClearSelection}
                                        className="text-xs font-bold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 focus:outline-none bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span> Cancel &amp; List New
                                    </button>
                                )}
                            </div>

                            {/* REJECTION REASON CARD (Renders only if status is rejected) [4] */}
                            {selectedProduct && (
                                <div className={`p-4 rounded-2xl border mb-6 flex flex-col gap-2 ${
                                    selectedProduct.verificationStatus === 'approved'
                                        ? 'bg-lime-50 border-lime-200 text-lime-800'
                                        : selectedProduct.verificationStatus === 'pending'
                                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                        <span className="material-symbols-outlined">
                                            {selectedProduct.verificationStatus === 'approved' ? 'check_circle' : selectedProduct.verificationStatus === 'pending' ? 'schedule' : 'cancel'}
                                        </span>
                                        <span className="uppercase tracking-wider">
                                            Product Status: {selectedProduct.verificationStatus}
                                        </span>
                                    </div>
                                    {selectedProduct.verificationStatus === 'rejected' && selectedProduct.rejectionReason && (
                                        <div className="mt-2 text-xs leading-relaxed bg-white/50 p-3 rounded-xl border border-red-200/50">
                                            <span className="font-bold text-red-900 block mb-1">Rejection Cause:</span>
                                            {selectedProduct.rejectionReason}
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    
                                    {/* Product Images Selector */}
                                    <div>
                                        <div 
                                            onClick={() => !isUploading && productImagesInputRef.current.click()}
                                            className={`border-2 border-dashed bg-zinc-50 hover:bg-lime-50/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden min-h-[140px] ${
                                                touchedFields.images && !isImagesValid
                                                    ? 'border-red-400 bg-red-50/10'
                                                    : 'border-zinc-200 hover:border-lime-500'
                                            }`}
                                        >
                                            <input 
                                                type="file" 
                                                ref={productImagesInputRef}
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'product')}
                                            />
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
                                                    <span className="animate-spin text-lime-600 text-2xl material-symbols-outlined">sync</span>
                                                    <p className="text-xs font-semibold text-zinc-600">Uploading...</p>
                                                </div>
                                            )}
                                            {images.length > 0 ? (
                                                <div className="absolute inset-0 w-full h-full z-10">
                                                    <img src={images[images.length - 1]} alt="Product Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-bold">Add ({images.length})</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => handleRemoveProductImage(images.length - 1, e)}
                                                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full flex items-center justify-center focus:outline-none"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-zinc-400 group-hover:text-lime-500 text-3xl mb-2 transition-colors">cloud_upload</span>
                                                    <p className="text-sm font-bold text-zinc-700 mb-1">Product Images</p>
                                                    <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
                                                </>
                                            )}
                                        </div>
                                        {touchedFields.images && !isImagesValid && (
                                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">error</span> At least one product image is required.
                                            </p>
                                        )}
                                    </div>

                                    {/* Nutrition Label Photo Selector */}
                                    <div>
                                        <div 
                                            onClick={() => !isUploading && nutritionImageInputRef.current.click()}
                                            className={`border-2 border-dashed bg-zinc-50 hover:bg-lime-50/50 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden min-h-[140px] ${
                                                touchedFields.nutritionTableImage && !isNutritionValid
                                                    ? 'border-red-400 bg-red-50/10'
                                                    : 'border-zinc-200 hover:border-lime-500'
                                            }`}
                                        >
                                            <input 
                                                type="file" 
                                                ref={nutritionImageInputRef}
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, 'nutrition')}
                                            />
                                            {nutritionTableImage ? (
                                                <div className="absolute inset-0 w-full h-full z-10">
                                                    <img src={nutritionTableImage} alt="Nutrition Table Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                                                        <span className="text-white text-xs font-bold">Change Image</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={handleClearNutritionImage}
                                                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full flex items-center justify-center focus:outline-none"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-zinc-400 group-hover:text-lime-500 text-3xl mb-2 transition-colors">document_scanner</span>
                                                    <p className="text-sm font-bold text-zinc-700 mb-1">Nutrition Label Photo</p>
                                                    <p className="text-xs text-zinc-500">Upload back of packaging</p>
                                                </>
                                            )}
                                        </div>
                                        {touchedFields.nutritionTableImage && !isNutritionValid && (
                                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">error</span> Nutritional label packaging photo is required.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body">
                                    {/* Product Title */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-bold text-zinc-700">Product Title</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-zinc-400">shopping_bag</span>
                                            </div>
                                            <input 
                                                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border-0 ring-1 focus:ring-2 focus:ring-lime-500 rounded-2xl text-zinc-800 placeholder-zinc-400 transition-all text-sm ${
                                                    touchedFields.title && !isTitleValid ? 'ring-red-400 focus:ring-red-400' : 'ring-zinc-200'
                                                }`} 
                                                placeholder="e.g., Artisan Multigrain Loaf" 
                                                type="text"
                                                required
                                                value={title}
                                                onBlur={() => handleBlur('title')}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                        </div>
                                        {touchedFields.title && !isTitleValid && (
                                            <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">error</span> Product title cannot be empty.
                                            </p>
                                        )}
                                    </div>

                                    {/* Price DZD */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-zinc-700">Price (DZD)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="material-symbols-outlined text-zinc-400">payments</span>
                                            </div>
                                            <input 
                                                className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border-0 ring-1 focus:ring-2 focus:ring-lime-500 rounded-2xl text-zinc-800 placeholder-zinc-400 transition-all text-sm ${
                                                    touchedFields.priceDZD && !isPriceValid ? 'ring-red-400 focus:ring-red-400' : 'ring-zinc-200'
                                                }`} 
                                                placeholder="0" 
                                                step="any" 
                                                min="0.01"
                                                type="number"
                                                required
                                                value={priceDZD}
                                                onBlur={() => handleBlur('priceDZD')}
                                                onChange={e => setPriceDZD(e.target.value)}
                                            />
                                        </div>
                                        {touchedFields.priceDZD && !isPriceValid && (
                                            <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">error</span> Price must be greater than 0.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="space-y-2 font-body">
                                    <label className="block text-sm font-bold text-zinc-700">Product Category</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-zinc-400">category</span>
                                        </div>
                                        <select 
                                            className={`w-full pl-11 pr-4 py-3 bg-zinc-50 border-0 ring-1 focus:ring-2 focus:ring-lime-500 rounded-2xl text-zinc-800 transition-all appearance-none text-sm ${
                                                touchedFields.category && !isCategoryValid ? 'ring-red-400 focus:ring-red-400' : 'ring-zinc-200'
                                            }`}
                                            required
                                            value={category}
                                            onBlur={() => handleBlur('category')}
                                            onChange={e => setCategory(e.target.value)}
                                        >
                                            <option value="" disabled>Select a category</option>
                                            {CATEGORY_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-zinc-400">expand_more</span>
                                        </div>
                                    </div>
                                    {touchedFields.category && !isCategoryValid && (
                                        <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-sm">error</span> Please select a category.
                                        </p>
                                    )}
                                </div>

                                {/* Product Description */}
                                <div className="space-y-2 font-body">
                                    <label className="block text-sm font-bold text-zinc-700">Product Description</label>
                                    <textarea 
                                        className={`w-full px-4 py-3 bg-zinc-50 border-0 ring-1 focus:ring-2 focus:ring-lime-500 rounded-2xl text-zinc-800 placeholder-zinc-400 transition-all text-sm resize-none ${
                                            touchedFields.description && !isDescriptionValid ? 'ring-red-400 focus:ring-red-400' : 'ring-zinc-200'
                                        }`} 
                                        placeholder="Describe your product (min 10, max 500 characters)..." 
                                        rows="3"
                                        required
                                        value={description}
                                        onBlur={() => handleBlur('description')}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center text-xs px-1">
                                        {touchedFields.description && !isDescriptionValid ? (
                                            <p className="text-red-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">error</span> Must be between 10 and 500 characters.
                                            </p>
                                        ) : (
                                            <span className="text-zinc-400">Must be between 10 and 500 characters.</span>
                                        )}
                                        <span className={touchedFields.description && !isDescriptionValid ? 'text-red-500 font-bold' : 'text-zinc-400'}>
                                            {description.length}/500
                                        </span>
                                    </div>
                                </div>

                                <hr className="border-zinc-100" />

                                {/* Macro bento cells */}
                                <div className="font-body">
                                    <label className="block text-sm font-bold text-zinc-700 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lime-600 text-[20px]">nutrition</span>
                                        Nutritional Profile (per serving)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        
                                        {/* Calories */}
                                        <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-colors ${
                                            touchedFields.calories && !isCaloriesValid ? 'bg-red-50/10 border-red-300' : 'bg-orange-50/50 border-orange-100/50 hover:border-orange-200'
                                        }`}>
                                            <label className="text-xs font-bold text-orange-800/70 uppercase tracking-wider block mb-2 font-headline">Calories</label>
                                            <div className="flex items-end gap-1">
                                                <input 
                                                    className="w-full bg-transparent border-0 p-0 text-2xl font-bold text-zinc-800 focus:ring-0 placeholder-zinc-300" 
                                                    placeholder="0" 
                                                    type="number"
                                                    min="0.1"
                                                    max="9999"
                                                    step="any"
                                                    required
                                                    value={calories}
                                                    onBlur={() => handleBlur('calories')}
                                                    onChange={e => setCalories(e.target.value)}
                                                />
                                                <span className="text-sm font-medium text-zinc-500 pb-1 font-body">kcal</span>
                                            </div>
                                        </div>

                                        {/* Protein */}
                                        <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-colors ${
                                            touchedFields.proteinGrams && !isProteinValid ? 'bg-red-50/10 border-red-300' : 'bg-blue-50/50 border-blue-100/50 hover:border-blue-200'
                                        }`}>
                                            <label className="text-xs font-bold text-blue-800/70 uppercase tracking-wider block mb-2 font-headline">Protein (g)</label>
                                            <div className="flex items-end gap-1">
                                                <input 
                                                    className="w-full bg-transparent border-0 p-0 text-2xl font-bold text-zinc-800 focus:ring-0 placeholder-zinc-300" 
                                                    placeholder="0" 
                                                    type="number"
                                                    min="0.1"
                                                    max="999"
                                                    step="any"
                                                    required
                                                    value={proteinGrams}
                                                    onBlur={() => handleBlur('proteinGrams')}
                                                    onChange={e => setProteinGrams(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Carbs */}
                                        <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-colors ${
                                            touchedFields.carbsGrams && !isCarbsValid ? 'bg-red-50/10 border-red-300' : 'bg-emerald-50/50 border-emerald-100/50 hover:border-emerald-200'
                                        }`}>
                                            <label className="text-xs font-bold text-emerald-800/70 uppercase tracking-wider block mb-2 font-headline">Carbs (g)</label>
                                            <div className="flex items-end gap-1">
                                                <input 
                                                    className="w-full bg-transparent border-0 p-0 text-2xl font-bold text-zinc-800 focus:ring-0 placeholder-zinc-300" 
                                                    placeholder="0" 
                                                    type="number"
                                                    min="0.1"
                                                    max="999"
                                                    step="any"
                                                    required
                                                    value={carbsGrams}
                                                    onBlur={() => handleBlur('carbsGrams')}
                                                    onChange={e => setCarbsGrams(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Fats */}
                                        <div className={`p-4 rounded-2xl border relative overflow-hidden group transition-colors ${
                                            touchedFields.fatGrams && !isFatsValid ? 'bg-red-50/10 border-red-300' : 'bg-amber-50/50 border-amber-100/50 hover:border-amber-200'
                                        }`}>
                                            <label className="text-xs font-bold text-amber-800/70 uppercase tracking-wider block mb-2 font-headline">Fats (g)</label>
                                            <div className="flex items-end gap-1">
                                                <input 
                                                    className="w-full bg-transparent border-0 p-0 text-2xl font-bold text-zinc-800 focus:ring-0 placeholder-zinc-300" 
                                                    placeholder="0" 
                                                    type="number"
                                                    min="0.1"
                                                    max="999"
                                                    step="any"
                                                    required
                                                    value={fatGrams}
                                                    onBlur={() => handleBlur('fatGrams')}
                                                    onChange={e => setFatGrams(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    
                                    {/* Macro-level warning aggregation */}
                                    {(touchedFields.calories && !isCaloriesValid) ||
                                     (touchedFields.proteinGrams && !isProteinValid) ||
                                     (touchedFields.carbsGrams && !isCarbsValid) ||
                                     (touchedFields.fatGrams && !isFatsValid) ? (
                                        <p className="text-red-500 text-xs mt-3 flex items-center gap-1 font-body">
                                            <span className="material-symbols-outlined text-sm">error</span> 
                                            Nutritional items must be greater than 0 (Max 9,999 kcal / 999g per macro serving).
                                        </p>
                                    ) : null}
                                </div>

                                {/* Contains Allergens options */}
                                <div className="font-body">
                                    <label className="block text-sm font-bold text-zinc-700 mb-3">Allergens Contained</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ALLERGEN_OPTIONS.map((allergen) => {
                                            const isSelected = containsAllergens.includes(allergen.value);
                                            return (
                                                <button 
                                                    key={allergen.value}
                                                    type="button"
                                                    onClick={() => handleAllergenToggle(allergen.value)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                        isSelected
                                                            ? 'bg-lime-50 border-2 border-lime-500 text-lime-800 font-bold shadow-[0_0_10px_rgba(132,204,22,0.1)]'
                                                            : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600'
                                                    }`}
                                                >
                                                    {allergen.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {submitError || creationErrors}

                                <div className="pt-4">
                                    {isFormValid && !isUploading ? (
                                        <button 
                                            type="submit"
                                            disabled={updating}
                                            className="w-full bg-lime-600 hover:bg-lime-700 text-white py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-lime-600/20 focus:outline-none font-headline"
                                        >
                                            <span className="material-symbols-outlined">
                                                {selectedProduct ? "save_as" : "add_circle"}
                                            </span>
                                            {selectedProduct ? (updating ? "Saving..." : "Save Product Details") : "Publish Product"}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            disabled
                                            className="w-full bg-zinc-100 text-zinc-400 py-4 rounded-2xl font-bold text-lg cursor-not-allowed flex justify-center items-center gap-2 font-headline"
                                        >
                                            <span className="material-symbols-outlined">
                                                {selectedProduct ? "save_as" : "add_circle"}
                                            </span>
                                            {isUploading ? "Uploading Images..." : (selectedProduct ? "Save Product Details" : "Publish Product")}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

VendorProducts.getInitialProps = async (context, client, currentUser) => {
    try {
        const { data: initialProducts } = await client.get('/api/products/my-products'); // Fetch vendor-specific directly [4]
        return { 
            initialProducts, 
            currentUser 
        };
    } catch (err) {
        return { 
            initialProducts: [], 
            currentUser 
        };
    }
};