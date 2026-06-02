import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

export default function Header({ currentUser }) {
    const router = useRouter();
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Dynamic unread count fetching on mount and on route transitions
    useEffect(() => {
        if (!currentUser) return;

        const fetchUnreadCount = async () => {
            try {
                const { data } = await axios.get("/api/chat/conversations/unread-count");
                setUnreadMessages(data.unreadCount || 0);
            } catch (err) {
                console.error("Header unread messages aggregation failed:", err.message);
            }
        };

        fetchUnreadCount();
    }, [currentUser, router.pathname]); // Re-calculates when path swaps

    // Reusable active & inactive tab styles from the Stitch template
    const activeTabClass = "font-label-md text-label-md text-primary dark:text-primary-fixed border-b-2 border-primary hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200 scale-95 transition-transform duration-150 pb-1";
    const inactiveTabClass = "font-label-md text-label-md text-zinc-500 dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200 pb-1";

    return (
        <header className="bg-surface dark:bg-background shadow-sm w-full px-gutter max-w-container-max mx-auto h-16 sticky top-0 z-50 flex justify-between items-center border-b border-zinc-100/50">
            {/* Left Brand Area */}
            <div className="flex items-center gap-6">
                {/* Brand Logo: Always redirects to the Root Landing Page */}
                <Link href="/" className="flex items-center gap-2 focus:outline-none cursor-pointer">
                    <span 
                        className="material-symbols-outlined text-primary dark:text-primary-fixed text-3xl select-none"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        eco
                    </span>
                    <span className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary-fixed tracking-tight font-headline">
                        GhidhAI
                    </span>
                </Link>

                {/* 
                  1. VENDOR WORKSPACE NAVIGATION TABS:
                  Displayed only when the logged-in user is a vendor.
                */}
                {currentUser && currentUser.role === "vendor" && (
                    <nav className="hidden md:flex gap-8 ml-8">
                        <Link 
                            href="/vendor/products" 
                            className={router.pathname === "/vendor/products" ? activeTabClass : inactiveTabClass}
                        >
                            Products
                        </Link>
                        <Link 
                            href="/vendor/orders" 
                            className={router.pathname === "/vendor/orders" ? activeTabClass : inactiveTabClass}
                        >
                            Orders
                        </Link>
                        {/* Vendor direct chat workspace tab */}
                        <Link 
                            href="/chat" 
                            className={router.pathname === "/chat" ? activeTabClass : inactiveTabClass}
                        >
                            Messages
                        </Link>
                    </nav>
                )}

                {/* 
                  2. CUSTOMER WORKSPACE NAVIGATION TABS:
                  Enables customers to easily access Marketplace, Orders list, and Messages.
                */}
                {currentUser && currentUser.role === "customer" && (
                    <nav className="hidden md:flex gap-8 ml-8">
                        <Link 
                            href="/products" 
                            className={router.pathname === "/products" ? activeTabClass : inactiveTabClass}
                        >
                            Marketplace
                        </Link>
                        <Link 
                            href="/orders" 
                            className={router.pathname === "/orders" ? activeTabClass : inactiveTabClass}
                        >
                            Orders
                        </Link>
                        {/* Customer direct chat workspace tab */}
                        <Link 
                            href="/chat" 
                            className={router.pathname === "/chat" ? activeTabClass : inactiveTabClass}
                        >
                            Messages
                        </Link>
                    </nav>
                )}

                {/* 
                  3. GUEST VISITORS NAVIGATION TABS:
                  Enables anonymous users to browse the Marketplace catalog (/products) [4].
                */}
                {!currentUser && (
                    <nav className="hidden md:flex gap-8 ml-8">
                        <Link 
                            href="/products" 
                            className={router.pathname === "/products" ? activeTabClass : inactiveTabClass}
                        >
                            Marketplace
                        </Link>
                    </nav>
                )}

                {/* Customer Portal Badge */}
                {currentUser && currentUser.role === "customer" && (
                    <span className="ml-4 px-3 py-1 bg-primary-container/10 text-primary dark:text-primary-fixed text-[11px] font-bold rounded-full uppercase tracking-wider select-none">
                        Customer Portal
                    </span>
                )}
            </div>

            {/* Right Actions Area */}
            <div className="flex items-center gap-4">
                {currentUser ? (
                    <>
                        {/* Live unread chat action icon next to notifications */}
                        <Link 
                            href="/chat" 
                            className="text-zinc-500 dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200 p-2 rounded-full hover:bg-surface-variant/30 focus:outline-none relative"
                        >
                            <span className="material-symbols-outlined block text-[22px]">chat</span>
                            {unreadMessages > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                            )}
                        </Link>

                        {/* Notifications */}
                        <button className="text-zinc-500 dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200 p-2 rounded-full hover:bg-surface-variant/30 focus:outline-none">
                            <span className="material-symbols-outlined block text-[22px]">notifications</span>
                        </button>

                        {/* 
                          Vendor Quick Action: 
                          Displayed only when a vendor is navigating outside of their workspace manager dashboard.
                        */}
                        {currentUser.role === "vendor" && router.pathname !== "/vendor/products" && (
                            <Link 
                                href="/vendor/products" 
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-full font-label-md text-label-md transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] duration-150 focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span> Add Product
                            </Link>
                        )}

                        {/* Customer Quick Action (AI Recommendations Link) */}
                        {currentUser.role === "customer" && (
                            <Link 
                                href="/ai-recommendations" 
                                className="bg-primary-container/15 hover:bg-primary-container/25 text-primary dark:text-primary-fixed px-5 py-2 rounded-full font-label-md text-label-md transition-all flex items-center gap-2 focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[18px] select-none">nutrition</span> AI Recommendations
                            </Link>
                        )}

                        {/* User Profile Pill Button */}
                        <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-4 py-2 rounded-full font-label-md text-label-md text-zinc-800">
                            <span className="material-symbols-outlined text-zinc-500 text-[18px] select-none">account_circle</span>
                            <span>{currentUser.fullName || currentUser.email || "Active Member"}</span>
                        </div>

                        {/* Sign Out Button */}
                        <Link 
                            href="/auth/signout" 
                            className="bg-surface-container-high hover:bg-surface-variant text-zinc-800 px-5 py-2 rounded-full font-label-md text-label-md transition-colors"
                        >
                            Sign Out
                        </Link>
                    </>
                ) : ( 
                    <>
                        {/* Guest actions styled to match Stitch Sign In/Sign Up buttons */}
                        <Link 
                            href="/auth/signin" 
                            className="font-label-md text-label-md text-zinc-800 hover:text-primary transition-colors px-4 py-2"
                        >
                            Sign In
                        </Link>
                        <Link 
                            href="/auth/signup" 
                            className="font-label-md text-label-md bg-lime-600 text-white px-6 py-2 rounded-full hover:bg-lime-700 transition-colors shadow-sm"
                        >
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}