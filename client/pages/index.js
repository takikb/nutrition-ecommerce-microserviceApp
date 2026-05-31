import { useState, useEffect } from "react";
import Link from "next/link";
import Router from "next/router";

export default function Home({ recommendations, productsCatalog, currentUser }) {
    const [cartCount, setCartCount] = useState(0);
    const [addingProductId, setAddingProductId] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    
    // Animation tracking for progress indicators
    const [animatedWidths, setAnimatedWidths] = useState({ protein: '0%', carbs: '0%', fats: '0%' });

    // Customer Macro Animation Controller
    useEffect(() => {
        if (currentUser && currentUser.role === 'customer' && recommendations?.target_macros) {
            const targets = recommendations.target_macros;
            
            const leadProduct = recommendations.recommended_products?.[0] || { protein_g: 0, carbs_g: 0, fats_g: 0 };
            const pPercent = targets.target_protein > 0 ? Math.min(100, Math.round((leadProduct.protein_g / targets.target_protein) * 100)) : 0;
            const cPercent = targets.target_carbs > 0 ? Math.min(100, Math.round((leadProduct.carbs_g / targets.target_carbs) * 100)) : 0;
            const fPercent = targets.target_fats > 0 ? Math.min(100, Math.round((leadProduct.fats_g / targets.target_fats) * 100)) : 0;

            const timer = setTimeout(() => {
                setAnimatedWidths({
                    protein: `${pPercent}%`,
                    carbs: `${cPercent}%`,
                    fats: `${fPercent}%`
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [currentUser, recommendations]);

    const handleAddToCart = (productTitle, productId) => {
        setAddingProductId(productId);
        setCartCount(prev => prev + 1);
        setToastMessage(`Added "${productTitle}" to your active plan!`);
        
        setTimeout(() => setAddingProductId(null), 800);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // =========================================================================
    // 🏠 MODE A: VISITOR LANDING PORTAL (Logged Out)
    // =========================================================================
        return (
            <div className="bg-[#fdf8f3] text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen pb-24 md:pb-12">

                <style jsx global>{`
                    body { font-family: 'Manrope', sans-serif; background-color: #fdf8f3; }
                    .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
                    .organic-shape { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                `}</style>

                {toastMessage && (
                    <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 animate-enter text-sm font-medium">
                        <span className="material-symbols-outlined text-lime-400">check_circle</span>
                        {toastMessage}
                    </div>
                )}

                <main>
                    {/* Hero Section */}
                    <section className="relative pt-24 pb-32 overflow-hidden">
                        <div className="max-w-container-max mx-auto px-4 md:px-gutter grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative z-10 space-y-8 animate-enter">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-100 text-lime-800 font-label-md text-label-md">
                                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span> AI-Powered Nutrition
                                </div>
                                <h1 className="font-headline-xl text-headline-xl text-zinc-900 leading-tight">
                                    Smart nutrition,<br />
                                    <span className="bg-gradient-to-r to-[#84cc16] bg-clip-text text-transparent from-lime-900">
                                        Designed for you.
                                    </span>
                                </h1>
                                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                                    Personalized meals tailored to your unique biology and goals. Experience the future of nutrition, delivered directly to your plate.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link href="/auth/signup" className="bg-lime-600 text-on-primary text-center px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-lime-700 hover:shadow-lg transition-all duration-300">
                                        Get Your Plan
                                    </Link>
                                    <a href="#menu" className="border border-primary text-primary text-center px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-primary/5 transition-all duration-300">
                                        Explore Menu
                                    </a>
                                </div>
                            </div>
                            
                            <div className="relative h-[600px] flex justify-center items-center">
                                <div className="absolute inset-0 bg-secondary-fixed/30 organic-shape animate-[spin_30s_linear_infinite] blur-3xl opacity-60"></div>
                                <div className="relative z-10 w-full max-w-[500px]">
                                    <img 
                                        alt="Superfood Quinoa Bowl" 
                                        className="w-full h-auto rounded-full shadow-2xl object-cover hover:scale-105 transition-transform duration-700 ease-in-out border border-zinc-100" 
                                        src="https://lh3.googleusercontent.com/aida/ADBb0uh2HuNVZP7-KDwRV-4YZe19W4bpqE4iDvP3aeFbm24MXteKvgwBxefa_J3FcTt_FHUNxz0J3D7pcIkb4Ii7NAyfeV0qpXGb-CPHvPwaZ8XDabSlKtFGF5XjHD4B_M839fvWU9Axnif9js5T5LcKTwMxtrqZiNbMlTc1tfrp0_zcxFdsyA_N64nxqvA1yhjfAwGBkZ9JULEO9kyVC1yb8OywDGjX-XCROpGhCsZf0BvGTKkY4Xw5f8rZkJmQ"
                                    />
                                    <div className="absolute rounded-3xl shadow-md flex items-center gap-4 py-2 px-4 bottom-4 left-4 border bg-white/30 backdrop-blur-lg border-white/20 animate-bounce" style={{ animationDuration: '6s' }}>
                                        <div className="bg-lime-600/40 backdrop-blur-md text-lime-900 dark:text-lime-200 rounded-full flex items-center justify-center font-bold w-10 h-10 text-sm">98%</div>
                                        <div>
                                            <div className="font-label-md text-label-md text-zinc-900">AI Match</div>
                                            <div className="font-label-sm text-label-sm text-on-surface-variant">Based on your profile</div>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md py-2 px-4 rounded-3xl shadow-md flex items-center gap-3 border border-white/20 animate-bounce" style={{ animationDuration: '6s' }}>
                                        <div className="bg-orange-100/40 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[20px] text-orange-600">balance</span>
                                        </div>
                                        <div>
                                            <div className="font-label-md text-label-md text-zinc-900">Macro Balance</div>
                                            <div className="font-label-sm text-label-sm text-on-surface-variant">Optimized</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Steps Section */}
                    <section className="py-24 bg-surface-container-low">
                        <div className="max-w-container-max mx-auto px-4 md:px-gutter text-center space-y-16">
                            <h2 className="font-headline-md text-headline-md text-zinc-900">From Profile to Plate</h2>
                            <div className="grid md:grid-cols-3 gap-12">
                                <div className="bg-surface p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-[32px]">assignment_ind</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-zinc-900 mb-4">1. Activity Profile</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant">Take our quick health profile quiz to establish your baseline metabolic needs and dietary restrictions.</p>
                                </div>
                                <div className="bg-surface p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow relative">
                                    <div className="hidden md:block absolute top-1/2 -left-6 w-12 border-t-2 border-dashed border-outline-variant -translate-y-1/2"></div>
                                    <div className="hidden md:block absolute top-1/2 -right-6 w-12 border-t-2 border-dashed border-outline-variant -translate-y-1/2"></div>
                                    <div className="w-16 h-16 bg-secondary-container/20 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-[32px]">psychology</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-zinc-900 mb-4">2. AI Optimization</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant">Our engine crafts the perfect macro-split and selects superfoods tailored just for you.</p>
                                </div>
                                <div className="bg-surface p-8 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <span className="material-symbols-outlined text-[32px]">store</span>
                                    </div>
                                    <h3 className="font-headline-md text-headline-md text-zinc-900 mb-4">3. Local Vendor Matches</h3>
                                    <p className="font-body-md text-body-md text-on-surface-variant">Purchase tailored meals and products directly from approved local vendors. Cash on Delivery supported.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Catalog / Trending Section */}
                    <section id="menu" className="py-24">
                        <div className="max-w-container-max mx-auto px-4 md:px-gutter">
                            <div className="flex justify-between items-end mb-12">
                                <div>
                                    <h2 className="text-3xl font-extrabold font-headline text-zinc-900 mb-2">Trending Meals</h2>
                                    <p className="text-sm text-zinc-500 font-body">Top picks currently boosting energy across our community.</p>
                                </div>
                                {/* View All Redirects to separate Marketplace Page */}
                                <Link 
                                    href="/products" 
                                    className="hidden sm:flex items-center gap-2 text-primary font-label-md text-label-md hover:underline cursor-pointer"
                                >
                                    View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {productsCatalog.slice(0, 3).map((p) => {
                                    const pid = p.id || p._id;
                                    return (
                                        <div key={pid} className="bg-surface rounded-[24px] shadow-sm overflow-hidden border border-surface-variant group flex flex-col h-full">
                                            <div className="h-64 bg-surface-container-high relative overflow-hidden">
                                                <Link href="/products/[productId]" as={`/products/${pid}`} className="block w-full h-full">
                                                    <img 
                                                        alt={p.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
                                                        src={p.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400"}
                                                    />
                                                </Link>
                                                <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur px-3 py-1 rounded-full font-label-sm text-label-sm text-primary flex items-center gap-1 shadow-sm">
                                                    <span className="material-symbols-outlined text-[14px]">local_fire_department</span> Best Seller
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <Link href="/products/[productId]" as={`/products/${pid}`}>
                                                    <h3 className="font-headline-md text-headline-md text-zinc-900 mb-2 truncate hover:text-primary transition-colors cursor-pointer">{p.title}</h3>
                                                </Link>
                                                <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">{p.description}</p>
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="font-headline-md text-headline-md text-zinc-900">{p.priceDZD} <span className="text-sm text-on-surface-variant font-normal font-sans">DZD</span></span>
                                                    <button 
                                                        onClick={() => handleAddToCart(p.title, pid)}
                                                        className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all focus:outline-none"
                                                    >
                                                        <span className="material-symbols-outlined">add</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Paywall Sign-Up Section */}
                    <section className="py-32 bg-zinc-900 relative overflow-hidden text-center text-white">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
                        
                        <div className="max-w-container-max mx-auto px-4 md:px-gutter relative z-10 space-y-8">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(101,163,13,0.3)] border border-primary/30">
                                <span className="material-symbols-outlined text-primary text-[40px]">lock</span>
                            </div>
                            <h2 className="font-headline-xl text-headline-xl text-white mb-6">Unlock Your AI Nutrition Profile</h2>
                            <p className="font-body-lg text-body-lg text-zinc-400 max-w-2xl mx-auto mb-12">
                                Discover exactly what your body needs. Join thousands optimizing their health with personalized insights.
                            </p>
                            
                            <div className="flex justify-center gap-6 opacity-40 blur-[2px] pointer-events-none select-none">
                                <div className="bg-zinc-800 rounded-2xl p-6 w-64 text-left border border-zinc-700">
                                    <div className="w-10 h-10 bg-zinc-700 rounded-full mb-4"></div>
                                    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                                </div>
                                <div className="bg-zinc-800 rounded-2xl p-6 w-64 text-left border border-zinc-700 hidden sm:block">
                                    <div className="w-10 h-10 bg-zinc-700 rounded-full mb-4"></div>
                                    <div className="h-4 bg-zinc-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                                </div>
                            </div>
                            
                            <div className="pt-4 animate-bounce" style={{ animationDuration: '4s' }}>
                                <Link href="/auth/signup" className="bg-lime-500 text-zinc-900 px-10 py-5 rounded-xl font-headline-md text-headline-md hover:bg-lime-400 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(101,163,13,0.4)]">
                                    Sign Up to Unlock
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        );

    // =========================================================================
    // 🔐 GUARD STATE: RENDERING SPIN BLOCK WHILE ROUTING OTHER ROLES (Admin/Vendor)
    // =========================================================================
    if (currentUser.role !== 'customer') {
        return (
            <div className="bg-[#fdf8f3] min-h-screen flex flex-col items-center justify-center gap-4">
                <span className="animate-spin text-lime-600 text-4xl material-symbols-outlined">sync</span>
                <p className="text-sm font-semibold text-zinc-500">Redirecting to workspace...</p>
            </div>
        );
    }

    // =========================================================================
    // 🔐 MODE B: CUSTOMER RECOMMENDATION FEED (Logged In Customers Only)
    // =========================================================================
    const targets = recommendations?.target_macros;
    const recommendedProducts = recommendations?.recommended_products || [];
    const userAllergies = currentUser.healthData?.allergy || [];
    
    // Dynamic allergen filter
    const activeRestrictedItems = productsCatalog ? productsCatalog.filter(product => 
        product.containsAllergens?.some(allergen => userAllergies.includes(allergen))
    ) : [];

    return (
        <div className="bg-orange-50/50 text-zinc-900 min-h-screen pb-24 md:pb-12 font-sans selection:bg-lime-200">

            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 animate-enter text-sm font-medium">
                    <span className="material-symbols-outlined text-lime-400">check_circle</span>
                    {toastMessage}
                </div>
            )}

            <main className="pt-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12 animate-enter">
                
                {/* Section 1: Daily Targets */}
                <section>
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h2 className="font-headline text-3xl font-bold text-zinc-900">Your Personalized Plan</h2>
                            <p className="text-sm text-zinc-500 mt-1 font-body">Calculated daily nutritional targets based on your TDEE and primary health goal.</p>
                        </div>
                        {/* Interactive Redirect Link to full separate catalog for logged-in users */}
                        <Link 
                            href="/products" 
                            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-2"
                        >
                            Explore Marketplace <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>

                    {!targets ? (
                        <div className="bg-white rounded-[1.5rem] p-10 text-center border border-zinc-100 shadow-sm animate-pulse">
                            <span className="animate-spin text-lime-600 text-3xl material-symbols-outlined mb-2">sync</span>
                            <p className="text-zinc-500 font-medium font-body">AI is generating your custom macro split targets...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-enter">
                            {/* Target Calories */}
                            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="material-symbols-outlined text-[#f97316] bg-[#ffedd5] p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        local_fire_department
                                    </span>
                                    <span className="font-label text-xs font-semibold text-zinc-500">Daily Target</span>
                                </div>
                                <div>
                                    <div className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-zinc-900">
                                        {Math.round(targets.target_calories).toLocaleString()}
                                    </div>
                                    <div className="font-body text-sm text-zinc-500">kcal</div>
                                </div>
                            </div>

                            {/* Protein */}
                            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="material-symbols-outlined text-[#f43f5e] bg-[#ffe4e6] p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        set_meal
                                    </span>
                                    <span className="font-label text-xs font-semibold text-zinc-500">Protein</span>
                                </div>
                                <div>
                                    <div className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-zinc-900">
                                        {Math.round(targets.target_protein)}<span className="text-[20px] font-medium">g</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-[#f43f5e] h-full rounded-full transition-all duration-1000 ease-out animate-pulse" style={{ width: animatedWidths.protein }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Carbs */}
                            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="material-symbols-outlined text-[#f59e0b] bg-[#fef3c7] p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        grass
                                    </span>
                                    <span className="font-label text-xs font-semibold text-zinc-500">Carbohydrates</span>
                                </div>
                                <div>
                                    <div className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-zinc-900">
                                        {Math.round(targets.target_carbs)}<span className="text-[20px] font-medium">g</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-[#f59e0b] h-full rounded-full transition-all duration-1000 ease-out animate-pulse" style={{ width: animatedWidths.carbs }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Fats */}
                            <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100 transition-transform hover:-translate-y-1 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="material-symbols-outlined text-[#eab308] bg-[#fef08a] p-2 rounded-full" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        water_drop
                                    </span>
                                    <span className="font-label text-xs font-semibold text-zinc-500">Fats</span>
                                </div>
                                <div>
                                    <div className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-zinc-900">
                                        {Math.round(targets.target_fats)}<span className="text-[20px] font-medium">g</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-2 rounded-full mt-2 overflow-hidden">
                                        <div className="bg-[#eab308] h-full rounded-full transition-all duration-1000 ease-out animate-pulse" style={{ width: animatedWidths.fats }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Section 2: Recommended Products Grid */}
                <section>
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h2 className="font-headline text-3xl font-bold text-zinc-900">Top Matches For You</h2>
                            <p className="text-sm text-zinc-500 mt-1 font-body">Ranked by our Cosine Similarity algorithm to fit your dynamic macro requirements.</p>
                        </div>
                        <Link 
                            href="/products" 
                            className="text-primary hover:underline font-label-md text-label-md flex items-center gap-1"
                        >
                            View Full Catalog <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>

                    {recommendedProducts.length === 0 ? (
                        <div className="bg-white rounded-[1.5rem] p-12 text-center border border-zinc-100 shadow-sm animate-enter">
                            <span className="material-symbols-outlined text-zinc-300 text-6xl mb-4">recommend</span>
                            <p className="text-zinc-500 font-medium font-body">No products matching your targets are currently available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter">
                            {recommendedProducts.map((p) => {
                                const pid = p.id || p._id;
                                return (
                                    <div key={pid} className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-zinc-100 relative group flex flex-col h-full">
                                        
                                        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-100 flex items-center space-x-1">
                                            <span className="text-[14px]">✨</span>
                                            <span className="font-label text-xs font-bold text-lime-700">{p.match_score}% Match</span>
                                        </div>

                                        <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                                            <Link href="/products/[productId]" as={`/products/${pid}`} className="focus:outline-none block w-full h-full">
                                                <img 
                                                    alt={p.title} 
                                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 cursor-pointer" 
                                                    src={p.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600"}
                                                />
                                            </Link>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <Link href="/products/[productId]" as={`/products/${pid}`} className="hover:underline focus:outline-none">
                                                <h3 className="font-headline text-[20px] font-bold text-zinc-900 mb-1 truncate cursor-pointer">{p.title}</h3>
                                            </Link>
                                            <div className="font-label text-sm font-semibold text-lime-700 mb-4">{p.price_dzd || p.priceDZD} DZD</div>
                                            
                                            <div className="flex space-x-4 mb-6 text-center border-t border-b border-zinc-50 py-3 mt-auto">
                                                <div className="flex-1">
                                                    <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Cals</span>
                                                    <span className="font-label text-sm font-bold text-zinc-800">{p.calories}</span>
                                                </div>
                                                <div className="flex-1 border-l border-zinc-100">
                                                    <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Prot</span>
                                                    <span className="font-label text-sm font-bold text-zinc-800">{p.protein_g || p.proteinGrams}g</span>
                                                </div>
                                                <div className="flex-1 border-l border-zinc-100">
                                                    <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Carbs</span>
                                                    <span className="font-label text-sm font-bold text-zinc-800">{p.carbs_g || p.carbsGrams}g</span>
                                                </div>
                                                <div className="flex-1 border-l border-zinc-100">
                                                    <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Fats</span>
                                                    <span className="font-label text-sm font-bold text-zinc-800">{p.fats_g || p.fatGrams}g</span>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => handleAddToCart(p.title, pid)}
                                                disabled={addingProductId === pid}
                                                className="w-full bg-lime-100 hover:bg-lime-200 text-lime-800 font-label text-sm font-semibold py-3 rounded-xl transition-colors focus:outline-none flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                                                {addingProductId === pid ? "Adding..." : "Add to Cart"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Section 3: Dynamic Excluded Allergens */}
                {activeRestrictedItems.length > 0 && (
                    <section className="pb-12 animate-enter">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="material-symbols-outlined text-zinc-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                health_and_safety
                            </span>
                            <h2 className="font-headline text-2xl font-bold text-zinc-900">Excluded by your Health Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
                            {activeRestrictedItems.map((item) => {
                                const pid = item.id || item._id;
                                return (
                                    <div 
                                        key={pid}
                                        className="bg-white rounded-[1.5rem] overflow-hidden border border-zinc-200 relative opacity-70 grayscale-[40%] transition-all hover:grayscale-0 hover:opacity-100 group"
                                    >
                                        <div className="absolute inset-0 bg-white/10 z-10 pointer-events-none"></div>
                                        <div className="absolute top-4 left-4 right-4 z-20">
                                            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-xs font-label font-bold flex items-center space-x-2 shadow-sm border border-red-200">
                                                <span className="material-symbols-outlined text-[18px]">warning</span>
                                                <span className="capitalize">
                                                    Allergy Alert: Contains {item.containsAllergens?.filter(a => userAllergies.includes(a)).join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-48 w-full bg-zinc-100 relative">
                                            <img 
                                                alt={item.title} 
                                                className="w-full h-full object-cover" 
                                                src={item.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400"} 
                                            />
                                        </div>
                                        <div className="p-6 relative z-20">
                                            <h3 className="font-headline text-[20px] font-bold text-zinc-900 mb-1">{item.title}</h3>
                                            <div className="font-label text-sm font-semibold text-zinc-500 mb-4">{item.priceDZD} DZD</div>
                                            <button className="w-full bg-zinc-100 text-zinc-400 font-label text-sm font-semibold py-3 rounded-xl cursor-not-allowed" disabled>
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 rounded-t-[1.5rem] bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.04)] border-t border-zinc-100">
                <div className="flex justify-around items-center w-full px-2 py-3 pb-safe">
                    <button className="flex flex-col items-center justify-center text-zinc-500 px-4 py-1.5 hover:bg-zinc-50 rounded-[0.75rem] transition-all focus:outline-none">
                        <span className="material-symbols-outlined mb-1">dashboard</span>
                        <span className="font-label text-[10px] font-semibold">Feed</span>
                    </button>
                    <button className="flex flex-col items-center justify-center bg-lime-100 text-lime-700 rounded-[0.75rem] px-4 py-1.5 scale-95 transition-all focus:outline-none">
                        <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
                        <span className="font-label text-[10px] font-semibold">Macros</span>
                    </button>
                    <button className="flex flex-col items-center justify-center text-zinc-500 px-4 py-1.5 hover:bg-zinc-50 rounded-[0.75rem] transition-all focus:outline-none">
                        <span className="material-symbols-outlined mb-1">person</span>
                        <span className="font-label text-[10px] font-semibold">Profile</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

// SSR aggregation
Home.getInitialProps = async (context, client, currentUser) => {
    let recommendations = null;
    let productsCatalog = [];

    if (currentUser) {
        if (currentUser.role === 'vendor') {
            if (context.res) {
                context.res.writeHead(302, { Location: '/vendor/products' });
                context.res.end();
            } else {
                Router.push('/vendor/products');
            }
            return { recommendations: null, productsCatalog: [] };
        }
        if (currentUser.role === 'admin') {
            if (context.res) {
                context.res.writeHead(302, { Location: '/admin/audit' });
                context.res.end();
            } else {
                Router.push('/admin/audit');
            }
            return { recommendations: null, productsCatalog: [] };
        }
    }

    try {
        const { data } = await client.get('/api/products');
        productsCatalog = data;
    } catch (err) {
        console.error("Failed to fetch product catalog metadata from backend:", err.message);
        
        productsCatalog = [
            {
                id: "trend_1",
                title: "Vitality Greens Bowl",
                description: "A crisp blend of nutrient-dense greens, wild-caught salmon, and our signature ginger-turmeric dressing.",
                priceDZD: 1200,
                images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCQwSr1FNvlu0NW2jHMMzEFC-Z5QfxwlBYDp1GHQDenwLFIkpVbUAD7v8645Fg0CiMCO2Dm2BN0SIId8QdL841mwXOALUrFKse3ksK3siC-eCyVXXF_Ul62j_P9mga3McZV5rmkfFo_yaMGpBZ_VQrBoW0oCRcCOvkBDBb9WowXdJ2nW8gWaNruJfXc4X6jOUOL0jEeaY6k8Q7VJgvP7JUYlZGLERN-mbSH-VQRUxx2XVbPj0DYqr8RUsr5-PK1hy5e1Vx_y-RHcX3m"]
            },
            {
                id: "trend_2",
                title: "Recovery Roast",
                description: "Slow-roasted root vegetables over ancient grains, designed to replenish glycogen stores post-workout.",
                priceDZD: 1200,
                images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuA4pFe-4GXA8PTFH8OexVGkpVjaou9xkygjFKiiKa_RGVacsBf-oI18ueqTR-DQf-eIfhMbjjC94v-TAi1aWms3VHog6hmevdDVDRy_BGirC1mFG8f58XJ9K4CApyLCvHB4G9bZkIZLVjc9ZDyHmG3PoTlNPv7JJM0VwkEsrRWEKAKH0Yywbcm7_D7PtS-iehl9lhIRLhe8_2DeunB_70Lq6-4KHQlUeprfy_OMxwIB30IWHDqaGz7VUYC_FtUbRr07ewDgry7semIv"]
            },
            {
                id: "trend_3",
                title: "Focus Protein Plate",
                description: "Lean protein paired with brain-boosting fats and low-GI carbs for sustained mental clarity.",
                priceDZD: 1200,
                images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuB9n3qagDeOCj7RfFDXFyEoRKOnkN1lIUVSYdIBPqZxLOjX58k_AEf5GWzJXiw0JPwGvuw9obipuTfzFS0jxGS8Xo-o6Nn4W2D9fCg25X60C15moH9mh4Vj6hLq4MuuqylEDZR6vzE8AUn6XgCWtiEhv0fM0H1BXG7Fr-TBx9L1QM99SotycUZPD-FirWaQ_lmAozvxDxovNAx4NFrPzzz2I1DKqQGRSLglGyIbcbcYnjmEa8P5HNJHJEL2KQpdizVdq27E8e1kH-wm"]
            }
        ];
    }

    if (currentUser && currentUser.role === 'customer') {
        try {
            const { data } = await client.get(`/api/v1/recommendations/${currentUser.id}`);
            recommendations = data;
        } catch (err) {
            console.error("Failed to fetch custom AI matching layers:", err.message);
        }
    }

    return { 
        recommendations, 
        productsCatalog, 
        currentUser 
    };
};