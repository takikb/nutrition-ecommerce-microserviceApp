import { useState } from "react";
import Router from "next/router";
import axios from "axios";
import buildClient from "../../api/build-client";

export default function VendorOrders({ initialOrders, currentUser }) {
    const [orders, setOrders] = useState(initialOrders || []);
    const [activeOrder, setActiveOrder] = useState(orders[0] || null);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [actionLoading, setActionLoading] = useState(false);
    const [localError, setLocalError] = useState(null);

    // 1. Sort orders chronologically to establish static sequential IDs (Order #1, Order #2...) [4]
    const sortedChronological = [...orders].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const getOrderSequentialId = (order) => {
        if (!order) return 1;
        const idx = sortedChronological.findIndex(o => (o.id || o._id) === (order.id || order._id));
        return idx !== -1 ? idx + 1 : 1;
    };

    // Helper: Safely resolve customer name with defensive hash fallback for older records [4]
    const getCustomerDisplayName = (order) => {
        if (!order) return "Active Member";
        if (order.customerName) return order.customerName;
        // Fallback prefix from raw userId string
        return `Customer #${order.userId.substring(0, 5).toUpperCase()}`;
    };

    const handleSelectOrder = (order) => {
        setActiveOrder(order);
        setLocalError(null);
    };

    const filteredOrders = orders.filter(o => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        const customerName = getCustomerDisplayName(o).toLowerCase();
        const address = (o.deliveryAddress || "").toLowerCase();
        const phone = (o.phoneNumber || "").toLowerCase();
        
        return customerName.includes(query) || address.includes(query) || phone.includes(query);
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    // Generates correct name initials based on the resolved customer name [4]
    const getInitials = (order) => {
        if (!order) return "CU";
        const name = getCustomerDisplayName(order);
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const handleCompleteOrder = async () => {
        if (!activeOrder) return;

        const orderId = activeOrder.id || activeOrder._id;
        setActionLoading(true);
        setLocalError(null);

        try {
            const response = await axios.put(`/api/orders/${orderId}`);
            const updatedOrder = response.data;

            const nextOrdersList = orders.map(o => 
                (o.id === orderId || o._id === orderId) ? { ...o, status: updatedOrder.status } : o
            );
            setOrders(nextOrdersList);
            setActiveOrder({ ...activeOrder, status: updatedOrder.status });
        } catch (err) {
            console.error("Failed to complete order:", err);
            const errMsg = err.response?.data?.errors?.[0]?.message || "Failed to update order status.";
            setLocalError(errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="bg-orange-50/50 text-zinc-800 min-h-[calc(100vh-73px)] flex flex-col font-sans selection:bg-lime-200">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #d4d4d8;
                    border-radius: 20px;
                }
            `}</style>

            {/* Main Workspace Grid */}
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
                
                {/* INBOX COLUMN (Left Panel) */}
                <aside className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm shrink-0 gap-3">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
                            <input 
                                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-colors" 
                                placeholder="Search by name, address, or phone..." 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 space-y-4 pb-8 custom-scrollbar">
                        {filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-3xl p-10 text-center border border-zinc-100 shadow-sm">
                                <span className="material-symbols-outlined text-zinc-300 text-5xl mb-2">inbox</span>
                                <p className="text-zinc-500 font-medium text-sm">No marketplace orders found.</p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => {
                                const orderId = order.id || order._id;
                                const isSelected = activeOrder && (activeOrder.id === orderId || activeOrder._id === orderId);
                                const isCompleted = order.status === 'complete' || order.status === 'Complete';
                                const isCancelled = order.status === 'cancelled' || order.status === 'Cancelled';

                                return (
                                    <div 
                                        key={orderId}
                                        onClick={() => handleSelectOrder(order)}
                                        className={`rounded-3xl p-5 cursor-pointer transition-all shadow-sm border-2 ${
                                            isSelected 
                                                ? 'bg-lime-50/50 border-lime-500 ring-2 ring-lime-600/10' 
                                                : 'bg-white border-zinc-100 hover:border-lime-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            {/* Renders chronological sequential ID (e.g. Order #1) instead of raw hash [4] */}
                                            <span className="font-bold text-xs text-lime-600">Order #{getOrderSequentialId(order)}</span>
                                            
                                            {isCompleted && (
                                                <span className="bg-lime-50 text-lime-700 border border-lime-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span> Done
                                                </span>
                                            )}
                                            {isCancelled && (
                                                <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cancelled
                                                </span>
                                            )}
                                            {!isCompleted && !isCancelled && (
                                                <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Pending
                                                </span>
                                            )}
                                        </div>

                                        {/* Renders customer's real display name [4] */}
                                        <h3 className="font-bold text-zinc-800 text-lg mb-1 truncate">
                                            {getCustomerDisplayName(order)}
                                        </h3>
                                        <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">inventory_2</span> Quantity: {order.quantity} serving(s)
                                        </p>
                                        <div className="flex justify-between items-end border-t border-zinc-100 pt-3">
                                            <span className="text-xs text-zinc-400">{formatDate(order.createdAt)}</span>
                                            <span className="font-bold text-lime-700">{order.totalPriceDZD} DZD</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* DETAILS PANEL (Right Panel) */}
                <section className="lg:col-span-7 h-full flex flex-col bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                    {activeOrder ? (
                        <div className="flex flex-col h-full animate-enter">
                            
                            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl font-extrabold text-zinc-800 font-headline">Order #{getOrderSequentialId(activeOrder)}</h2>
                                    <p className="text-xs text-zinc-400 mt-0.5 font-body">Processed dynamically via orders microservice pipeline.</p>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                
                                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-lg select-none">
                                            {getInitials(activeOrder)}
                                        </div>
                                        <div>
                                            {/* Renders customer's real display name [4] */}
                                            <h4 className="font-bold text-zinc-800 text-base">
                                                {getCustomerDisplayName(activeOrder)}
                                            </h4>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 font-body">
                                                <span className="material-symbols-outlined text-sm">location_on</span> {activeOrder.deliveryAddress}
                                            </p>
                                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 font-body">
                                                <span className="material-symbols-outlined text-sm">call</span> {activeOrder.phoneNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-zinc-800 text-base mb-4 border-b border-zinc-100 pb-2">Order Items</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="w-16 h-16 rounded-lg bg-zinc-50 overflow-hidden shrink-0 border border-zinc-100 relative">
                                                <img 
                                                    alt={activeOrder.product?.title} 
                                                    className="w-full h-full object-cover" 
                                                    src={activeOrder.product?.images?.[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300"}
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-semibold text-zinc-800 truncate">{activeOrder.product?.title || "Item Listing Removed"}</h4>
                                                <p className="text-xs text-zinc-400 mt-0.5 font-body">Quantity: {activeOrder.quantity}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs text-zinc-400 font-body">{activeOrder.quantity} x {activeOrder.product?.priceDZD || (activeOrder.totalPriceDZD / activeOrder.quantity)} DZD</p>
                                                <p className="font-extrabold text-lime-600 font-headline">{activeOrder.totalPriceDZD} DZD</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs text-zinc-500 font-body">
                                            <span>Subtotal</span>
                                            <span>{activeOrder.totalPriceDZD} DZD</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 font-body">
                                            <span>Delivery Fee</span>
                                            <span>0 DZD (Free Delivery)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-zinc-500 mt-2 font-body">
                                            <span>Payment Method</span>
                                            <span className="font-bold text-lime-700 bg-lime-100 px-2.5 py-1 rounded-md text-xs uppercase tracking-wider">Cash on Delivery</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-zinc-200 pt-4">
                                        <span className="font-bold text-zinc-800">Total Amount</span>
                                        <span className="text-2xl font-extrabold text-lime-700 font-headline">{activeOrder.totalPriceDZD} DZD</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-100 bg-white flex flex-col gap-2 shrink-0">
                                {localError && (
                                    <p className="text-red-500 text-xs font-semibold flex items-center gap-1.5 px-2 animate-enter">
                                        <span className="material-symbols-outlined text-sm">error</span> {localError}
                                    </p>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button"
                                        disabled
                                        title="Only customers are authorized to initiate cancellations under your current backend order deletion schema."
                                        className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-400 font-semibold cursor-not-allowed opacity-60 text-sm focus:outline-none"
                                    >
                                        Customer Action Only
                                    </button>

                                    {activeOrder.status !== 'complete' && activeOrder.status !== 'Complete' && activeOrder.status !== 'Cancelled' && activeOrder.status !== 'cancelled' ? (
                                        <button 
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={handleCompleteOrder}
                                            className="px-6 py-3 rounded-xl bg-lime-600 text-white font-semibold hover:bg-lime-700 transition-colors shadow-sm flex items-center gap-2 focus:outline-none text-sm"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span> 
                                            {actionLoading ? "Processing..." : "Complete Order"}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            disabled
                                            className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-400 font-semibold cursor-not-allowed text-sm flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">done_all</span> 
                                            {activeOrder.status}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="p-20 text-center text-zinc-400 my-auto select-none">
                            <span className="material-symbols-outlined text-6xl mb-4">fact_check</span>
                            <p className="text-sm font-semibold font-headline">Select an order from the list to review details.</p>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}

VendorOrders.getInitialProps = async (context, client, currentUser) => {
    if (!currentUser || currentUser.role !== 'vendor') {
        if (context.res) {
            context.res.writeHead(302, { Location: '/' });
            context.res.end();
        } else {
            Router.push('/');
        }
        return { initialOrders: [] };
    }

    try {
        const { data } = await client.get('/api/orders');
        return { 
            initialOrders: data, 
            currentUser 
        };
    } catch (err) {
        console.error("Failed to fetch vendor active orders queue:", err.message);
        return { 
            initialOrders: [], 
            currentUser 
        };
    }
};