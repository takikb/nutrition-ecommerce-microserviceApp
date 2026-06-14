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
                                {/* FIXED: Conditional check redirects users to their dashboard if logged in [4] */}
                                {currentUser ? (
                                    <Link href="/ai-recommendations" className="bg-lime-600 text-on-primary text-center px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-lime-700 hover:shadow-lg transition-all duration-300">
                                        Go to Your Plan
                                    </Link>
                                ) : (
                                    <Link href="/auth/signup" className="bg-lime-600 text-on-primary text-center px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-lime-700 hover:shadow-lg transition-all duration-300">
                                        Get Your Plan
                                    </Link>
                                )}
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
                                    src="https://lh3.googleusercontent.com/aida/AP1WRLuXzS3LxET_-KD3ms-zHB1jNNcRRzkd2njqSfzyxiRAt5ZxJqZDTzQmJrUvT6-pkgC_NXlgYuVwG2_Gyez_OmL2RK4VHT_7me0F3d2O1ycjNcpWirbjsY-ISvWEqFg4NsHaf_R4fj6p7fcjViFIi1PYZOK3N9IXuzpMZ80T1iTPsiFWnJ5GITjKBkuC7xnl1aycGIF9pCkJIeqdc52uRno1XkU7r2n7Z4f2SIdJOVuXCljhvtQzte3cVNcz"
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

                {/* FIXED: Paywall Sign-Up Section is conditionally hidden when the user is signed in [4] */}
                {!currentUser && (
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
                )}
            </main>
        </div>
    );
}

// Next.js SSR Context Fetcher
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