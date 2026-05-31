import { useState } from "react";
import Router from "next/router";
import Link from "next/link";
import axios from "axios";
import buildClient from "../../api/build-client";

export default function ProductAuditQueue({ initialProducts, currentUser }) {
    const [allProducts, setAllProducts] = useState(initialProducts || []);
    
    // Extract only pending items for the audit list queue
    const pendingProducts = allProducts.filter(p => p.verificationStatus === 'pending');
    
    // Selected active product to review
    const [activeProduct, setActiveProduct] = useState(pendingProducts[0] || null);
    
    // Rejection reason state
    const [rejectionFeedback, setRejectionFeedback] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [localErrors, setLocalErrors] = useState(null);
    const [zoomModalImage, setZoomModalImage] = useState(null);

    // Calculate metrics in real-time from active database collections [4]
    const awaitingReviewCount = pendingProducts.length;
    const approvedCount = allProducts.filter(p => p.verificationStatus === 'approved').length;
    const rejectedCount = allProducts.filter(p => p.verificationStatus === 'rejected').length;

    // Handle Active item selection switch [4]
    const handleSelectProduct = (product) => {
        setActiveProduct(product);
        setRejectionFeedback("");
        setLocalErrors(null);
    };

    // Unified helper to send approval/rejection request to backend verify endpoint
    const handleVerifyProduct = async (status) => {
        if (!activeProduct) return;
        
        const productId = activeProduct.id || activeProduct._id;
        
        // Client-side guard check for rejection reason
        if (status === 'rejected' && rejectionFeedback.trim().length === 0) {
            setLocalErrors("A specific reason is required for rejection.");
            return;
        }

        setActionLoading(true);
        setLocalErrors(null);

        try {
            const response = await axios.put(`/api/products/${productId}/verify`, {
                status: status,
                rejectionReason: status === 'rejected' ? rejectionFeedback.trim() : undefined
            });

            const updatedProduct = response.data;

            // Optimistically update our local lists and metric counters
            setAllProducts(prev => 
                prev.map(p => (p.id === productId || p._id === productId) ? updatedProduct : p)
            );

            // Filter out the validated product from active pending array & select the next available one
            const remainingPending = pendingProducts.filter(p => p.id !== productId && p._id !== productId);
            setActiveProduct(remainingPending[0] || null);
            setRejectionFeedback("");

        } catch (err) {
            console.error("Verification error:", err);
            const serverErrors = err.response?.data?.errors;
            if (serverErrors && serverErrors.length > 0) {
                setLocalErrors(serverErrors.map(e => e.message).join(", "));
            } else {
                setLocalErrors("An error occurred during verification processing.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="bg-[#fffaf5] text-zinc-800 min-h-screen font-sans selection:bg-lime-200">

            {/* Custom Admin Banner */}
            <div className="bg-red-50 border-b border-red-100 text-red-700 py-2 px-8 text-center text-xs font-semibold uppercase tracking-wider">
                Admin Console Mode — Restrictive Access Privileges Enabled
            </div>

            {/* View Full Image Zoom Modal */}
            {zoomModalImage && (
                <div 
                    onClick={() => setZoomModalImage(null)}
                    className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-enter cursor-zoom-out"
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white p-2">
                        <img src={zoomModalImage} alt="Label Zoom" className="max-w-full max-h-[80vh] object-contain rounded-xl" />
                        <p className="text-center text-xs text-zinc-500 mt-2">Click anywhere to close zoom</p>
                    </div>
                </div>
            )}

            <div className="flex max-w-[1280px] mx-auto">
                
                {/* Side Navigation Bar */}
                <nav className="hidden md:flex bg-[#fffaf5] border-r border-zinc-200 h-[calc(100vh-101px)] w-64 flex-col p-4 sticky top-[101px]">
                    <div className="mb-8 px-4 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center select-none font-bold">
                                {currentUser?.fullName?.[0]?.toUpperCase() || "A"}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-800">Admin Console</h3>
                                <p className="text-xs text-zinc-500">Validation Queue</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-grow font-semibold">
                        <Link href="/" className="flex items-center gap-3 text-zinc-500 px-4 py-3 hover:bg-zinc-100 transition-all rounded-xl text-sm">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span>Dashboard</span>
                        </Link>
                        <a className="flex items-center gap-3 bg-lime-600 text-white rounded-xl px-4 py-3 hover:bg-lime-700 transition-all active:translate-x-1 duration-200 text-sm" href="#">
                            <span className="material-symbols-outlined">fact_check</span>
                            <span>Pending Reviews</span>
                        </a>
                    </div>
                </nav>

                {/* Main Content Canvas */}
                <main className="flex-1 p-6 md:p-8 w-full max-w-[1280px]">
                    
                    {/* Header & Metric stats */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-zinc-800 mb-2 font-headline">Product Audit Queue</h1>
                        <p className="text-sm text-zinc-500 mb-6 font-body">Review submitted vendor products, verify nutritional labels, and manage marketplace safety.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex items-center gap-4">
                                <div className="p-4 bg-orange-50 rounded-2xl">
                                    <span className="material-symbols-outlined text-orange-500 text-3xl">schedule</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Awaiting Review</p>
                                    <p className="text-xl font-extrabold text-zinc-800">{awaitingReviewCount} Products</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex items-center gap-4">
                                <div className="p-4 bg-lime-50 rounded-2xl">
                                    <span className="material-symbols-outlined text-lime-600 text-3xl">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Approved Total</p>
                                    <p className="text-xl font-extrabold text-zinc-800">{approvedCount} Products</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex items-center gap-4">
                                <div className="p-4 bg-red-50 rounded-2xl">
                                    <span className="material-symbols-outlined text-red-500 text-3xl">cancel</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rejected Total</p>
                                    <p className="text-xl font-extrabold text-zinc-800">{rejectedCount} Products</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left/Right Main Audit Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* LEFT COLUMN: PENDING ITEMS QUEUE LIST */}
                        <div className="lg:col-span-4 flex flex-col gap-4">
                            <h2 className="text-lg font-extrabold text-zinc-800 px-2 font-headline">Pending Items</h2>
                            {pendingProducts.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 border border-zinc-100 text-center shadow-sm">
                                    <span className="material-symbols-outlined text-zinc-300 text-4xl mb-2">done_all</span>
                                    <p className="text-zinc-500 text-sm font-medium">All clear! No items awaiting validation.</p>
                                </div>
                            ) : (
                                pendingProducts.map((p) => {
                                    const isSelected = activeProduct && (activeProduct.id === p.id || activeProduct._id === p._id);
                                    return (
                                        <div 
                                            key={p.id || p._id}
                                            onClick={() => handleSelectProduct(p)}
                                            className={`bg-white rounded-3xl p-4 shadow-sm cursor-pointer hover:bg-zinc-50 transition-all border-2 ${
                                                isSelected 
                                                    ? 'border-lime-600 ring-2 ring-lime-600/10' 
                                                    : 'border-zinc-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-sm font-bold text-zinc-800 truncate max-w-[180px]">{p.title}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isSelected ? 'bg-lime-600 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                                    {isSelected ? 'Active Review' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 mb-2 font-body">Vendor ID: {p.vendorId}</p>
                                            <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold font-body">
                                                <span>{p.priceDZD} DZD</span>
                                                <span>{p.category}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* RIGHT COLUMN: CURRENT DETAILED AUDIT PANEL */}
                        <div className="lg:col-span-8 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[500px]">
                            {activeProduct ? (
                                <div className="animate-enter">
                                    {/* Panel Header */}
                                    <div className="p-8 border-b border-zinc-100 flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-lime-600 uppercase tracking-wider mb-1 block">Vendor ID: {activeProduct.vendorId}</span>
                                            <h2 className="text-2xl font-extrabold text-zinc-800 mb-2 font-headline">{activeProduct.title}</h2>
                                            <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 font-body">
                                                <span className="material-symbols-outlined text-sm">category</span> {activeProduct.category}
                                            </span>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xl font-extrabold text-zinc-800 font-headline">{activeProduct.priceDZD} DZD</p>
                                        </div>
                                    </div>

                                    {/* Panel Body details */}
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        
                                        {/* Left: Product Image & Macros */}
                                        <div className="flex flex-col gap-6">
                                            <div className="rounded-2xl overflow-hidden h-64 bg-zinc-50 flex items-center justify-center border border-zinc-100 relative">
                                                <img 
                                                    alt={activeProduct.title} 
                                                    className="w-full h-full object-cover" 
                                                    src={activeProduct.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600"}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-zinc-800 mb-4 font-label">Reported Macros (per serving)</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-zinc-50 p-4 rounded-xl">
                                                        <p className="text-xs text-zinc-500 mb-1 font-body">Calories</p>
                                                        <p className="text-sm text-zinc-800 font-bold">{activeProduct.calories} kcal</p>
                                                    </div>
                                                    <div className="bg-zinc-50 p-4 rounded-xl">
                                                        <p className="text-xs text-zinc-500 mb-1 font-body">Protein</p>
                                                        <p className="text-sm text-zinc-800 font-bold">{activeProduct.proteinGrams}g</p>
                                                    </div>
                                                    <div className="bg-zinc-50 p-4 rounded-xl">
                                                        <p className="text-xs text-zinc-500 mb-1 font-body">Carbohydrates</p>
                                                        <p className="text-sm text-zinc-800 font-bold">{activeProduct.carbsGrams}g</p>
                                                    </div>
                                                    <div className="bg-zinc-50 p-4 rounded-xl">
                                                        <p className="text-xs text-zinc-500 mb-1 font-body">Fats</p>
                                                        <p className="text-sm text-zinc-800 font-bold">{activeProduct.fatGrams}g</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Nutrition Label Verification Plate */}
                                        <div className="flex flex-col gap-4">
                                            <h3 className="text-sm font-bold text-zinc-800 font-label">Uploaded Nutrition Label Proof</h3>
                                            <div className="rounded-2xl border-2 border-dashed border-zinc-200 h-full min-h-[300px] bg-zinc-50 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                                                <img 
                                                    alt="Nutrition Proof" 
                                                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                                                    src={activeProduct.nutritionTableImage || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600"}
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setZoomModalImage(activeProduct.nutritionTableImage)}
                                                    className="relative z-10 bg-white text-zinc-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">zoom_in</span> View Full Image
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footers Rejection/Approval */}
                                    <div className="p-8 bg-zinc-50 border-t border-zinc-100">
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-zinc-800 mb-2 font-label" htmlFor="feedback">
                                                Rejection Feedback (Required if Rejecting)
                                            </label>
                                            <textarea 
                                                className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all font-body resize-none" 
                                                id="feedback" 
                                                placeholder="Provide specific reasons for rejection (e.g., mismatch in calorie count)..." 
                                                rows="3"
                                                value={rejectionFeedback}
                                                onChange={e => setRejectionFeedback(e.target.value)}
                                            />
                                        </div>

                                        {localErrors && (
                                            <div className="mb-4 text-red-600 text-xs font-semibold flex items-center gap-1.5 animate-enter">
                                                <span className="material-symbols-outlined text-sm">error</span> {localErrors}
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-4">
                                            <button 
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleVerifyProduct('rejected')}
                                                className="px-6 py-3 rounded-xl bg-red-50 text-red-500 border border-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-base">close</span> Reject
                                            </button>
                                            <button 
                                                type="button"
                                                disabled={actionLoading}
                                                onClick={() => handleVerifyProduct('approved')}
                                                className="px-8 py-3 rounded-xl bg-lime-600 text-white text-xs font-bold hover:bg-lime-700 transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-base">check</span> Approve Product
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-20 text-center text-zinc-400">
                                    <span className="material-symbols-outlined text-6xl mb-4">fact_check</span>
                                    <p className="text-sm font-semibold font-headline">Select a pending product from the list to review details.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </main>

            </div>
        </div>
    );
}

// Next.js Server-Side Rendering Data Orchestrator [2]
ProductAuditQueue.getInitialProps = async (context, client, currentUser) => {
    // Role-protection validation logic on server side [2]
    if (!currentUser || currentUser.role !== 'admin') {
        if (context.res) {
            context.res.writeHead(302, { Location: '/' });
            context.res.end();
        } else {
            Router.push('/');
        }
        return { initialProducts: [] };
    }

    try {
        // Fetch all products across database replicas inside the cluster DNS [2]
        const { data } = await client.get('/api/products');
        return { 
            initialProducts: data, 
            currentUser 
        };
    } catch (err) {
        console.error("Failed to fetch product catalog registry for admin:", err.message);
        return { 
            initialProducts: [], 
            currentUser 
        };
    }
};