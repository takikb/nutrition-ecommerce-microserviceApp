import { useState, useEffect } from "react";
import Link from "next/link";
import Router from "next/router";
import buildClient from "../../api/build-client";

export default function AIRecommendationsPage({ recommendations, productsCatalog, currentUser }) {
    // Animation tracking for macro targets
    const [animatedWidths, setAnimatedWidths] = useState({ protein: '0%', carbs: '0%', fats: '0%' });

    // Dynamic Macro Progress Animation
    useEffect(() => {
        if (currentUser && recommendations?.target_macros) {
            const targets = recommendations.target_macros;
            
            // Calculate progress ratios dynamically using real backend data if present
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

    // If no authenticated user is logged in, show a call-to-action landing page
    if (!currentUser) {
        return (
            <div className="bg-orange-50/50 min-h-screen text-zinc-800 antialiased font-sans">
                <main className="max-w-4xl mx-auto px-8 py-24 text-center space-y-8 animate-enter">
                    <div className="w-20 h-20 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <span className="material-symbols-outlined text-4xl select-none">local_florist</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 font-headline">
                            AI-Driven Nutrition, Tailored to You
                        </h1>
                        <p className="text-lg text-zinc-600 max-w-xl mx-auto font-body">
                            Join NutriSync to discover healthy organic meals ranked precisely for your medical conditions, allergies, and physical macro goals.
                        </p>
                    </div>
                    <div className="flex justify-center gap-4">
                        <Link href="/auth/signup" className="bg-lime-600 hover:bg-lime-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-md shadow-lime-600/10">
                            Create Health Profile
                        </Link>
                        <Link href="/auth/signin" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-8 py-4 rounded-full font-bold transition-all">
                            Sign In
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    // Default Fallbacks if AI recommendations aren't calculated yet or backend is empty
    const targets = recommendations?.target_macros || {
        target_calories: 2000,
        target_protein: 140,
        target_carbs: 220,
        target_fats: 65
    };

    // Pulling products direct from your newly structured backend response payload
    const recommendedProducts = recommendations?.recommended_products || [];

    // Explainable AI: Dynamic Restricted items based on User's Allergies
    const userAllergies = currentUser.healthData?.allergy || [];
    
    // Dynamic allergen logic: filter the database product catalog instead of mock static lists [4]
    const activeRestrictedItems = productsCatalog ? productsCatalog.filter(product => 
        product.containsAllergens?.some(allergen => userAllergies.includes(allergen))
    ) : [];

    return (
        <div className="bg-orange-50/50 text-zinc-900 min-h-screen pb-24 md:pb-12 font-sans selection:bg-lime-200">
            <main className="pt-10 px-4 md:px-8 max-w-7xl mx-auto space-y-12 animate-enter">
                
                {/* SECTION 1: DAILY MACRO TARGETS */}
                <section>
                    <div className="mb-6">
                        <h2 className="font-headline text-3xl font-bold text-zinc-900">Your Personalized Plan</h2>
                        <p className="text-sm text-zinc-500 mt-1 font-body">Calculated daily nutritional targets based on your TDEE and primary health goal.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </section>

                {/* SECTION 2: RECOMMENDED MEALS MATCHES */}
                <section>
                    <div className="mb-6">
                        <h2 className="font-headline text-3xl font-bold text-zinc-900">Top Matches For You</h2>
                        <p className="text-sm text-zinc-500 mt-1 font-body">Ranked by our Cosine Similarity algorithm to fit your dynamic macro requirements.</p>
                    </div>

                    {recommendedProducts.length === 0 ? (
                        <div className="bg-white rounded-[1.5rem] p-12 text-center border border-zinc-100 shadow-sm animate-enter">
                            <span className="material-symbols-outlined text-zinc-300 text-6xl mb-4">recommend</span>
                            <p className="text-zinc-500 font-medium font-body">No products matching your targets are currently available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-enter">
                            {recommendedProducts.map((p) => (
                                <div key={p.id} className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-zinc-100 relative group flex flex-col h-full">
                                    
                                    {/* AI Match Badge float */}
                                    <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-100 flex items-center space-x-1">
                                        <span className="text-[14px]">✨</span>
                                        <span className="font-label text-xs font-bold text-lime-700">{p.match_score}% Match</span>
                                    </div>

                                    {/* Product image - FIXED: Dynamic Next.js route mapping [4] */}
                                    <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                                        <Link href="/products/[productId]" as={`/products/${p.id}`} className="block w-full h-full focus:outline-none">
                                            <img 
                                                alt={p.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
                                                src={p.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600"}
                                            />
                                        </Link>
                                    </div>

                                    {/* Card body details */}
                                    <div className="p-6 flex flex-col flex-1">
                                        {/* FIXED: Dynamic Next.js route mapping [4] */}
                                        <Link href="/products/[productId]" as={`/products/${p.id}`} className="hover:underline focus:outline-none cursor-pointer">
                                            <h3 className="font-headline text-[20px] font-bold text-zinc-900 mb-1 truncate hover:text-lime-700 transition-colors">{p.title}</h3>
                                        </Link>
                                        <div className="font-label text-sm font-semibold text-lime-700 mb-4">{p.price_dzd || p.priceDZD} DZD</div>
                                        
                                        {/* Macro Breakdown Grid */}
                                        <div className="flex space-x-4 mb-6 text-center border-t border-b border-zinc-50 py-3 mt-auto">
                                            <div className="flex-1">
                                                <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Cals</span>
                                                <span className="font-label text-sm font-bold text-zinc-800">{p.calories}</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Prot</span>
                                                <span className="font-label text-sm font-bold text-zinc-800">{p.protein_g}g</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Carbs</span>
                                                <span className="font-label text-sm font-bold text-zinc-800">{p.carbs_g}g</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[10px] text-zinc-400 uppercase tracking-wider block">Fats</span>
                                                <span className="font-label text-sm font-bold text-zinc-800">{p.fats_g}g</span>
                                            </div>
                                        </div>

                                        {/* FIXED: Replaced legacy "Add to Cart" button with dynamic "View Details" Link [4] */}
                                        <Link href="/products/[productId]" as={`/products/${p.id}`} className="w-full">
                                            <button className="w-full bg-lime-100 hover:bg-lime-600 hover:text-white text-lime-800 font-label text-sm font-semibold py-3 rounded-xl transition-colors focus:outline-none text-center block cursor-pointer">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SECTION 3: EXPLAINABLE AI ALLERGEN WARNING SECTION */}
                {activeRestrictedItems.length > 0 && (
                    <section className="pb-12 animate-enter">
                        <div className="flex items-center space-x-3 mb-6">
                            <span className="material-symbols-outlined text-zinc-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                health_and_safety
                            </span>
                            <h2 className="font-headline text-2xl font-bold text-zinc-900">Excluded by your Health Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-enter">
                            {activeRestrictedItems.map((item) => (
                                <div 
                                    key={item.id || item._id} 
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
                                        <button className="w-full bg-zinc-100 text-zinc-500 font-label text-sm font-semibold py-3 rounded-xl cursor-not-allowed" disabled>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* Bottom Navigation for Mobile ergonomics */}
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

// Next.js SSR multi-service aggregation [2]
AIRecommendationsPage.getInitialProps = async (context, client, currentUser) => {
    if (!currentUser) {
        return { recommendations: null, productsCatalog: [], currentUser: null };
    }

    let recommendations = null;
    let productsCatalog = [];

    // 1. Fetch AI Recommendations (now including verified images arrays directly!) [4]
    try {
        const { data } = await client.get(`/api/v1/recommendations/${currentUser.id}`);
        recommendations = data;
    } catch (err) {
        console.error("Failed to retrieve recommendation data:", err.message);
    }

    // 2. Fetch the dynamic products catalog to determine allergen-restricted items dynamically [4]
    try {
        const { data } = await client.get('/api/products');
        productsCatalog = data;
    } catch (err) {
        console.error("Failed to fetch products catalog for restrictions:", err.message);
    }

    return { 
        recommendations, 
        productsCatalog,
        currentUser 
    };
};