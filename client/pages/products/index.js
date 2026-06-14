import { useState } from "react";
import Link from "next/link";

const ProductsCatalogPage = ({ recommendations, productsCatalog, currentUser }) => {
    // Catalog filters & view modes state (Only Category & Search)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    
    // Smart Cold-Start Fallback: If a user has no AI matches yet, default to standard view [1]
    const [viewMode, setViewMode] = useState(
        currentUser && recommendations?.recommended_products?.length > 0 
            ? "ai" 
            : "standard"
    );

    // Filter processing - exclusive check for Search & Category
    const filterProducts = (arr) => {
        return (arr || []).filter(p => {
            const matchesSearch = 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesCategory = 
                selectedCategory === "All Categories" || 
                p.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    };

    // Cross-Reference & Enrichment Mapping:
    // Merges raw AI-matches with the authoritative productsCatalog to restore missing category fields [4]
    const enrichedRecommendations = (recommendations?.recommended_products || []).map(rec => {
        const matchedProduct = productsCatalog.find(p => (p.id || p._id) === rec.id);
        if (matchedProduct) {
            return {
                ...matchedProduct,
                match_score: rec.match_score // Preserve the machine-learning match score [4]
            };
        }
        return rec;
    });

    const filteredCatalog = filterProducts(productsCatalog);
    // FIXED: Corrected to use enrichedRecommendations so category filtering works in AI Mode [4]
    const filteredRecommendations = filterProducts(enrichedRecommendations);

    // Dynamic grid distribution choice
    const activeProducts = viewMode === "ai" ? filteredRecommendations : filteredCatalog;

    return (
        <div className="bg-orange-50/50 text-zinc-900 min-h-screen pb-24 md:pb-16 font-sans">
            <main className="max-w-container-max mx-auto px-4 md:px-gutter py-8 animate-enter">
                
                {/* Title Segment & View Layout Toggle */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-headline-xl text-headline-xl text-zinc-800 mb-2">Explore the Marketplace</h1>
                        <p className="font-body-lg text-body-lg text-zinc-500">Discover organic, intelligent meals tailored for you.</p>
                    </div>

                    {currentUser && recommendations?.recommended_products?.length > 0 && (
                        <div className="flex items-center bg-zinc-200/50 p-1 rounded-full shadow-inner border border-outline-variant/30">
                            <button 
                                onClick={() => setViewMode('standard')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-all focus:outline-none ${
                                    viewMode === 'standard' 
                                        ? 'bg-white text-primary shadow-sm font-bold' 
                                        : 'text-zinc-500 hover:text-primary opacity-70'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                                Standard View
                            </button>
                            <button 
                                onClick={() => setViewMode('ai')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-all focus:outline-none ${
                                    viewMode === 'ai' 
                                        ? 'bg-white text-primary shadow-sm font-bold' 
                                        : 'text-zinc-500 hover:text-primary opacity-70'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">lock</span>
                                AI Mode
                            </button>
                        </div>
                    )}
                </div>

                {/* Updated Filter Controls with exact Enum-matching values */}
                <div className="bg-white border border-outline-variant/30 rounded-[24px] p-4 mb-8 shadow-soft flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[200px] relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input 
                            className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                            placeholder="Search meals, ingredients..." 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select 
                            className="px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl font-label-md text-label-md text-zinc-800 appearance-none pr-10 cursor-pointer focus:outline-none focus:border-primary"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All Categories">All Categories</option>
                            <option value="meal_prep">Meal Prep</option>
                            <option value="snack">Snack</option>
                            <option value="supplement">Supplement</option>
                            <option value="grocery">Grocery</option>
                            <option value="drink">Drink</option>
                        </select>
                    </div>
                </div>

                {/* Grid Content Distribution */}
                {activeProducts.length === 0 ? (
                    <div className="py-16 text-center text-zinc-400 font-body-lg bg-white rounded-3xl border border-zinc-100 shadow-sm">
                        <span className="material-symbols-outlined text-6xl mb-4 text-zinc-300">recommend</span>
                        <p>No products fit the selected criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {activeProducts.map((p) => {
                            const pid = p.id || p._id;
                            
                            // Safe dynamic fallback parsing logic for price properties
                            const rawPrice = p.priceDZD ?? p.price_dzd ?? p.price ?? 0;
                            const displayPrice = Number(rawPrice).toLocaleString();

                            return (
                                <div key={pid} className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-soft-hover hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer h-full relative">
                                    
                                    {viewMode === "ai" && p.match_score && (
                                        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-zinc-100 flex items-center space-x-1">
                                            <span>✨</span>
                                            <span className="font-label text-xs font-bold text-lime-700">{p.match_score}% Match</span>
                                        </div>
                                    )}

                                    <div className="h-48 w-full bg-surface-variant overflow-hidden relative">
                                        <Link href="/products/[productId]" as={`/products/${pid}`} className="block w-full h-full">
                                            <img 
                                                alt={p.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                                src={p.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"}
                                            />
                                        </Link>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <span className="text-secondary font-label-sm text-[10px] tracking-wider uppercase mb-2">
                                            {p.vendor || "GhidhAI Premium"}
                                        </span>
                                        <Link href="/products/[productId]" as={`/products/${pid}`}>
                                            <h3 className="font-headline-md text-headline-md text-zinc-800 mb-1 hover:text-primary transition-colors cursor-pointer">
                                                {p.title}
                                            </h3>
                                        </Link>
                                        <p className="font-body-md text-body-md text-zinc-500 line-clamp-2 mb-4">{p.description}</p>
                                        
                                        {/* Nutrition Metrics Info Bar */}
                                        <div className="flex space-x-3 text-center border-t border-b border-zinc-100 py-2.5 mb-4 mt-auto">
                                            <div className="flex-1">
                                                <span className="font-label text-[9px] text-zinc-400 uppercase block">Calories</span>
                                                <span className="text-xs font-bold text-zinc-800">{p.calories || 0}</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[9px] text-zinc-400 uppercase block">Prot</span>
                                                <span className="text-xs font-bold text-zinc-800">{p.protein_g || p.proteinGrams || 0}g</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[9px] text-zinc-400 uppercase block">Carbs</span>
                                                <span className="text-xs font-bold text-zinc-800">{p.carbs_g || p.carbsGrams || 0}g</span>
                                            </div>
                                            <div className="flex-1 border-l border-zinc-100">
                                                <span className="font-label text-[9px] text-zinc-400 uppercase block">Fats</span>
                                                <span className="text-xs font-bold text-zinc-800">{p.fats_g || p.fatGrams || 0}g</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start w-full">
                                            <span className="font-headline-md text-headline-md text-lime-700">
                                                {displayPrice} DZD
                                            </span>
                                            {/* FIXED: Replaced legacy "Add to Plan" button with "View Details" link [4] */}
                                            <Link href="/products/[productId]" as={`/products/${pid}`} className="w-full mt-4">
                                                <button className="w-full bg-lime-100 hover:bg-lime-600 hover:text-white text-lime-700 py-2.5 rounded-xl transition-all font-semibold focus:outline-none text-center block text-sm">
                                                    View Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

// SSR Catalog Aggregation
ProductsCatalogPage.getInitialProps = async (context, client, currentUser) => {
    let recommendations = null;
    let productsCatalog = [];

    try {
        const { data } = await client.get('/api/products');
        productsCatalog = data;
    } catch (err) {
        console.error("Failed to fetch product catalog metadata from backend:", err.message);
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

export default ProductsCatalogPage;