import { useState, useEffect } from "react";
import Link from "next/link";
import Router from "next/router";
import axios from "axios"; // Imported Axios for direct API calls [4]
import useRequest from "../../hooks/use-request";

export default function ProductDetailsPage({ product, matchScore, currentUser }) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [initiatingChat, setInitiatingChat] = useState(false); // Chat loading state [4]
    
    // Checkout Form States
    const [quantity, setQuantity] = useState(1);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [touchedFields, setTouchedFields] = useState({});
    
    const [animatedWidths, setAnimatedWidths] = useState({ protein: '0%', carbs: '0%', fats: '0%' });

    // Dynamic Macro Progress Animation
    useEffect(() => {
        if (product) {
            const timer = setTimeout(() => {
                setAnimatedWidths({
                    protein: `${Math.min(100, ((product.protein_g ?? product.proteinGrams ?? 0) / 40) * 100)}%`,
                    carbs: `${Math.min(100, ((product.carbs_g ?? product.carbsGrams ?? 0) / 80) * 100)}%`,
                    fats: `${Math.min(100, ((product.fats_g ?? product.fatGrams ?? 0) / 30) * 100)}%`
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [product]);

    // Pre-populate phone number if available in currentUser profile from signup
    useEffect(() => {
        if (currentUser?.vendorData?.phoneNumber) {
            setPhoneNumber(currentUser.vendorData.phoneNumber);
        }
    }, [currentUser]);

    // Corrected Hook: Removed static productId to prevent initial-mount closure bugs [4]
    const { doRequest, errors } = useRequest({
        url: "/api/orders",
        method: "post",
        onSuccess: (order) => Router.push(`/orders/`)
    });

    const handleBlur = (field) => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
    };

    // Form boundary constraints matching backend
    const isAddressValid = deliveryAddress.trim() !== "";
    const isPhoneValid = phoneNumber.trim().length >= 8 && /^\+?\d+$/.test(phoneNumber.trim());
    const isCheckoutValid = isAddressValid && isPhoneValid && quantity >= 1;

    const handlePlaceOrderSubmit = async (event) => {
        event.preventDefault();
        
        if (!isCheckoutValid) {
            setTouchedFields({ deliveryAddress: true, phoneNumber: true });
            return;
        }

        const exactProductId = product.id || product._id;

        // Pass the productId dynamically on invocation to guarantee accurate ObjectId lookup [4]
        await doRequest({
            productId: exactProductId,
            quantity: parseInt(quantity, 10),
            deliveryAddress: deliveryAddress.trim(),
            phoneNumber: phoneNumber.trim()
        });
    };

    // Direct Conversation Initiation Handler [4]
    const handleContactVendor = async () => {
        if (!currentUser) {
            Router.push("/auth/signin");
            return;
        }

        setInitiatingChat(true);
        const exactProductId = product.id || product._id;

        try {
            // Call the backend conversation route directly [4]
            const { data: conversation } = await axios.post("/api/chat/conversations", {
                productId: exactProductId,
                vendorId: product.vendorId,
                productTitle: product.title,
                productPrice: rawPrice
            });

            // Navigate directly to the Chat window passing the ID to active select instantly [4]
            Router.push({
                pathname: "/chat",
                query: { activeId: conversation.id }
            });
        } catch (err) {
            console.error("Failed to initiate chat channel:", err.message);
        } finally {
            setInitiatingChat(false);
        }
    };

    if (!product) {
        return (
            <div className="bg-orange-50/50 min-h-screen flex flex-col items-center justify-center gap-4">
                <span className="animate-spin text-lime-600 text-4xl material-symbols-outlined">sync</span>
                <p className="text-sm font-semibold text-zinc-500">Product not found or offline...</p>
                <Link href="/" className="text-lime-600 hover:underline">
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    const rawPrice = product.priceDZD ?? product.price_dzd ?? product.price ?? 0;
    const formattedPrice = Number(rawPrice).toLocaleString();
    const totalPrice = (rawPrice * quantity).toLocaleString();
    const activeImage = product.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";

    return (
        <div className="bg-[#fdf8f3] text-zinc-800 antialiased pb-24 md:pb-16 font-sans selection:bg-lime-200">

            {/* CHECKOUT MODAL OVERLAY */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-enter">
                    <div className="bg-white rounded-[24px] max-w-md w-full p-6 md:p-8 border border-zinc-100 shadow-xl relative animate-enter">
                        <button 
                            type="button"
                            onClick={() => setIsCheckoutOpen(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="mb-6">
                            <span className="text-xs font-bold text-lime-600 uppercase tracking-wider block mb-1">Plan Checkout</span>
                            <h3 className="text-xl font-bold text-zinc-900">{product.title}</h3>
                            <p className="text-xs text-zinc-500 mt-1">Configure your delivery details to place the order.</p>
                        </div>

                        <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
                            
                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                                <span className="text-sm font-bold text-zinc-700">Quantity Servings</span>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 font-bold focus:outline-none"
                                    >
                                        -
                                    </button>
                                    <span className="text-base font-bold w-6 text-center">{quantity}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 font-bold focus:outline-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-zinc-700">Delivery Address</label>
                                <input 
                                    className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl text-sm focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors ${
                                        touchedFields.deliveryAddress && !isAddressValid ? 'border-red-300' : 'border-zinc-200'
                                    }`}
                                    placeholder="e.g. 12 Rue des Aurès, Hydra, Algiers"
                                    required
                                    type="text"
                                    value={deliveryAddress}
                                    onBlur={() => handleBlur('deliveryAddress')}
                                    onChange={e => setDeliveryAddress(e.target.value)}
                                />
                                {touchedFields.deliveryAddress && !isAddressValid && (
                                    <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Delivery address is required.
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-zinc-700">Phone Number</label>
                                <input 
                                    className={`w-full px-4 py-3 bg-zinc-50 border rounded-xl text-sm focus:outline-none focus:border-lime-600 focus:ring-1 focus:ring-lime-600 transition-colors ${
                                        touchedFields.phoneNumber && !isPhoneValid ? 'border-red-300' : 'border-zinc-200'
                                    }`}
                                    placeholder="e.g. 0555123456"
                                    required
                                    type="tel"
                                    value={phoneNumber}
                                    onBlur={() => handleBlur('phoneNumber')}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                />
                                {touchedFields.phoneNumber && !isPhoneValid && (
                                    <p className="text-red-500 text-[11px] flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-sm">error</span> Please enter a valid phone number.
                                    </p>
                                )}
                            </div>

                            <hr className="border-zinc-100" />

                            {/* Live calculation */}
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm font-bold text-zinc-800">Total Price</span>
                                <span className="text-xl font-extrabold text-lime-700">{totalPrice} DZD</span>
                            </div>

                            {/* Server validation errors */}
                            {errors && <div className="text-red-500 text-xs mt-2">{errors}</div>}

                            <div className="pt-2">
                                {isCheckoutValid ? (
                                    <button 
                                        type="submit"
                                        className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm focus:outline-none text-sm"
                                    >
                                        Place Order (Cash on Delivery)
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        disabled
                                        className="w-full bg-zinc-100 text-zinc-400 font-bold py-3.5 rounded-xl cursor-not-allowed text-sm"
                                    >
                                        Complete Required Fields
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <main className="max-w-container-max mx-auto px-4 md:px-8 py-8 md:py-12 animate-enter">
                
                {/* Back Navigation */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 transition-colors font-label-md text-label-md cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Feed
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6">
                    
                    {/* Left Column: Image & Verification */}
                    <div className="col-span-1 lg:col-span-5 space-y-6">
                        <div className="relative bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm aspect-square flex items-center justify-center p-4">
                            <img 
                                alt={product.title} 
                                className="w-full h-full object-cover rounded-[16px]" 
                                src={activeImage}
                            />
                            {product.verificationStatus === "approved" && (
                                <div className="absolute top-4 left-4 bg-white/85 backdrop-blur border border-white/35 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                    <span className="material-symbols-outlined text-lime-600 text-sm">eco</span>
                                    <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">100% Organic</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Carousel */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((imgUrl, i) => (
                                    <button key={i} className="flex-shrink-0 w-20 h-20 rounded-[12px] border-2 border-transparent hover:border-lime-600 overflow-hidden transition-colors focus:outline-none">
                                        <img alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" src={imgUrl} />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
                            <h3 className="font-bold text-zinc-800 text-sm mb-2 flex items-center gap-2 select-none">
                                <span className="material-symbols-outlined text-orange-500">verified</span>
                                NutriSync Source Verification
                            </h3>
                            <p className="text-xs text-zinc-500 leading-relaxed font-body">
                                This product data is directly parsed, validated, and synchronized from the catalog ledger of certified local merchants.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Details & AI Match */}
                    <div className="col-span-1 lg:col-span-7 space-y-8 flex flex-col">
                        
                        {/* Product Header */}
                        <div>
                            <span className="block text-orange-500 font-bold text-xs uppercase tracking-wider mb-2">
                                Verified Vendor Listing
                            </span>
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-3xl font-extrabold text-zinc-800 font-headline leading-tight">
                                    {product.title}
                                </h1>
                            </div>

                            {product.calories && (
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="inline-flex items-center justify-center px-3 py-1 bg-zinc-100 text-zinc-800 rounded-full text-xs font-semibold select-none">
                                        <span className="material-symbols-outlined text-[14px] text-orange-500 mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                                            local_fire_department
                                        </span>
                                        {product.calories} kcal
                                    </span>
                                </div>
                            )}

                            <p className="text-base text-zinc-500 leading-relaxed mb-6 font-body">
                                {product.description}
                            </p>

                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-extrabold text-zinc-800 font-headline">
                                    {formattedPrice} DZD
                                </span>
                            </div>
                        </div>

                        {/* AI Match Widget */}
                        {currentUser && currentUser.role === "customer" && matchScore && (
                            <div className="bg-white rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-zinc-100 shadow-sm animate-enter">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                    <div>
                                        <h2 className="font-headline text-lg font-bold text-zinc-800 flex items-center gap-2 select-none">
                                            <span className="material-symbols-outlined text-orange-500">auto_awesome</span>
                                            AI Match: {matchScore}% Optimal
                                        </h2>
                                        <p className="text-xs text-zinc-500 mt-1 font-body leading-relaxed">
                                            This meal aligns {matchScore >= 90 ? "exceptionally well" : "substantially"} with your biological macro split requirements.
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-lime-600 flex items-center justify-center bg-white shadow-sm select-none flex-shrink-0">
                                        <span className="text-lg font-extrabold text-lime-600">{matchScore}</span>
                                    </div>
                                </div>

                                {/* Granular Macro Data */}
                                <div className="space-y-5">
                                    {/* Protein Data */}
                                    {(product.proteinGrams !== undefined || product.protein_g !== undefined) && (
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-zinc-800">Protein ({product.protein_g ?? product.proteinGrams}g)</span>
                                                <span className="text-zinc-500">Amino Profile</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
                                                <div 
                                                    className="bg-lime-600 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: animatedWidths.protein }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Carbohydrates Data */}
                                    {(product.carbsGrams !== undefined || product.carbs_g !== undefined) && (
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-zinc-800">Complex Carbs ({product.carbs_g ?? product.carbsGrams}g)</span>
                                                <span className="text-zinc-500">Glycemic Load</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
                                                <div 
                                                    className="bg-orange-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: animatedWidths.carbs }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Healthy Fats Data */}
                                    {(product.fatGrams !== undefined || product.fats_g !== undefined) && (
                                        <div>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-zinc-800">Healthy Fats ({product.fats_g ?? product.fatGrams}g)</span>
                                                <span className="text-zinc-500">Essential Lipids</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
                                                <div 
                                                    className="bg-red-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: animatedWidths.fats }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Ingredients & Allergens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100">
                                <h4 className="font-semibold text-zinc-800 mb-2 text-sm font-label">Product Macros</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed font-body">
                                    Each serving contains {product.proteinGrams || product.protein_g}g of protein, {product.carbsGrams || product.carbs_g}g of carbohydrates, and {product.fatGrams || product.fats_g}g of fats.
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-zinc-100">
                                <h4 className="font-semibold text-zinc-800 mb-2 text-sm font-label">Allergen Safety</h4>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {product.containsAllergens && product.containsAllergens.length > 0 && product.containsAllergens[0] !== 'none' ? (
                                        product.containsAllergens.map((allergen, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-red-100 uppercase tracking-wider">
                                                <span className="material-symbols-outlined text-xs">warning</span> {allergen}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-3 py-1 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full flex items-center gap-1 border border-lime-100">
                                            <span className="material-symbols-outlined text-xs">check_circle</span> Allergen-Free
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Desktop Action Buttons */}
                        <div className="hidden md:flex gap-4 mt-auto pt-8">
                            {currentUser && currentUser.role === 'customer' ? (
                                <button 
                                    type="button"
                                    onClick={() => setIsCheckoutOpen(true)}
                                    className="flex-1 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none"
                                >
                                    <span className="material-symbols-outlined">add_shopping_cart</span>
                                    Add to Plan
                                </button>
                            ) : (
                                <Link 
                                    href="/auth/signup"
                                    className="flex-1 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-center"
                                >
                                    Sign Up to Order
                                </Link>
                            )}
                            
                            {/* FIXED: Action button directly triggers direct handshake helper [4] */}
                            <button 
                                type="button"
                                disabled={initiatingChat}
                                onClick={handleContactVendor}
                                className="px-6 border border-lime-600 text-lime-600 hover:bg-lime-50 font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm focus:outline-none cursor-pointer disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-[18px]">message_circle</span>
                                {initiatingChat ? "Connecting..." : "Contact Vendor"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="md:hidden fixed bottom-16 left-0 w-full bg-white border-t border-zinc-100 p-4 z-40 shadow-sm flex flex-col gap-3">
                <div className="flex gap-3">
                    
                    {/* FIXED: Action button triggers direct handshake helper [4] */}
                    <button 
                        type="button"
                        disabled={initiatingChat}
                        onClick={handleContactVendor}
                        className="px-4 border border-lime-600 text-lime-600 hover:bg-lime-50 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">message_circle</span>
                    </button>
                    
                    {currentUser && currentUser.role === 'customer' ? (
                        <button 
                            type="button"
                            onClick={() => setIsCheckoutOpen(true)}
                            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                            Add to Plan
                        </button>
                    ) : (
                        <Link 
                            href="/auth/signup"
                            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-center text-sm"
                        >
                            Sign Up to Order
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// Next.js SSR Context Fetcher
ProductDetailsPage.getInitialProps = async (context, client, currentUser) => {
    const { productId } = context.query;
    let product = null;
    let matchScore = null;

    try {
        const { data } = await client.get(`/api/products/${productId}`);
        product = data;
    } catch (err) {
        console.error("Failed to fetch product information from backend:", err.message);
    }

    if (currentUser && currentUser.role === 'customer') {
        try {
            const { data: recs } = await client.get(`/api/v1/recommendations/${currentUser.id}`);
            const match = recs?.recommended_products?.find(rp => rp.id === productId);
            if (match) {
                matchScore = match.match_score;
            }
        } catch (err) {
            console.error("Failed to fetch match metrics from recommendation engine:", err.message);
        }
    }

    return { product, matchScore, currentUser };
};