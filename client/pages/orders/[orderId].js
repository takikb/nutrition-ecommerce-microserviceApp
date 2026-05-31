// 1. Add the missing Next.js Link import [4]
import Link from "next/link"; 
import buildClient from "../../api/build-client";

export default function OrderTracking({ order, currentUser }) {
    return (
        <div className="min-h-screen bg-[#fdf8f3] text-zinc-800 font-sans">
            <main className="max-w-2xl mx-auto p-8 text-center space-y-6">
                <span className="material-symbols-outlined text-lime-600 text-5xl">task_alt</span>
                <h1 className="text-3xl font-bold">Order Placed Successfully!</h1>
                <p className="text-sm text-zinc-500">Order ID: {order?.id || order?._id}</p>
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 text-left">
                    <p className="font-bold">Delivery Address:</p>
                    <p className="text-zinc-600 mb-3">{order?.deliveryAddress}</p>
                    <p className="font-bold">Total Price:</p>
                    <p className="text-lime-700 font-bold">{order?.totalPriceDZD} DZD</p>
                </div>
                <Link href="/" className="inline-block bg-lime-600 text-white px-6 py-3 rounded-xl font-bold">
                    Back to Feed
                </Link>
            </main>
        </div>
    );
}

OrderTracking.getInitialProps = async (context, client, currentUser) => {
    const { orderId } = context.query;
    try {
        const { data } = await client.get(`/api/orders`);
        const order = data.find(o => o.id === orderId || o._id === orderId);
        return { order, currentUser };
    } catch (err) {
        return { order: null, currentUser };
    }
};