import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";

export default function Header({ currentUser }) {
    const router = useRouter();
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Dynamic unread count fetching on mount and on route transitions [4]
    useEffect(() => {
        // OPTIMIZATION: Do not query unread count if the user is a guest or an administrator [4]
        if (!currentUser || currentUser.role === "admin") return;

        const fetchUnreadCount = async () => {
            try {
                const { data } = await axios.get("/api/chat/conversations/unread-count");
                setUnreadMessages(data.unreadCount || 0);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setUnreadMessages(0);
                } else {
                    console.error("Header unread messages aggregation failed:", err.message);
                }
            }
        };

        fetchUnreadCount();
    }, [currentUser, router.pathname]);

    // Close dropdown menu when clicking outside of its container [4]
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Closes dropdown when routes change
    useEffect(() => {
        setIsDropdownOpen(false);
    }, [router.pathname]);

    // Helper: Extracts a friendly display name from JWT payload
    const getDisplayName = () => {
        if (!currentUser) return "Active Member";
        if (currentUser.fullName) return currentUser.fullName;
        if (currentUser.email) {
            const prefix = currentUser.email.split("@")[0];
            return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
        return "Active Member";
    };

    // Reusable active & inactive tab styles from the Stitch templates [4]
    const activeTabClass = "text-lime-700 font-bold border-b-2 border-lime-600 pb-1 text-sm transition-colors select-none";
    const inactiveTabClass = "text-zinc-500 hover:text-zinc-950 font-medium text-sm transition-colors select-none";

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 w-full">
            <nav className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
                
                {/* Left Brand Area */}
                <div className="flex items-center gap-3">
                    {/* Brand Logo: Always redirects to the Root Landing Page */}
                    <Link href="/" className="flex items-center gap-2 focus:outline-none cursor-pointer">
                        <span 
                            className="material-symbols-outlined text-lime-700 text-2xl select-none"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            eco
                        </span>
                        <span className="font-headline font-bold text-lime-700 text-xl tracking-tight font-headline">
                            GhidhAI
                        </span>
                    </Link>

                    {/* 1. VENDOR WORKSPACE PORTAL BADGE */}
                    {currentUser && currentUser.role === "vendor" && (
                        <span className="ml-4 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full uppercase tracking-wider select-none">
                            Vendor Portal
                        </span>
                    )}

                    {/* 2. CUSTOMER WORKSPACE PORTAL BADGE */}
                    {currentUser && currentUser.role === "customer" && (
                        <span className="ml-4 px-3 py-1 bg-lime-50 text-lime-700 text-xs font-semibold rounded-full uppercase tracking-wider select-none">
                            Customer Portal
                        </span>
                    )}
                </div>

                {/* Center Navigation Tabs */}
                <div className="hidden md:flex items-center gap-8">
                    
                    {/* A. VENDOR NAVIGATION LINKS */}
                    {currentUser && currentUser.role === "vendor" && (
                        <>
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
                            <Link 
                                href="/chat" 
                                className={router.pathname === "/chat" ? activeTabClass : inactiveTabClass}
                            >
                                Messages
                            </Link>
                        </>
                    )}

                    {/* B. CUSTOMER NAVIGATION LINKS */}
                    {currentUser && currentUser.role === "customer" && (
                        <>
                            <Link 
                                href="/" 
                                className={router.pathname === "/" ? activeTabClass : inactiveTabClass}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/products" 
                                className={router.pathname === "/products" ? activeTabClass : inactiveTabClass}
                            >
                                Kitchen
                            </Link>
                            <Link 
                                href="/orders" 
                                className={router.pathname === "/orders" ? activeTabClass : inactiveTabClass}
                            >
                                Orders
                            </Link>
                            <Link 
                                href="/chat" 
                                className={router.pathname === "/chat" ? activeTabClass : inactiveTabClass}
                            >
                                Messages
                            </Link>
                            <Link 
                                href="/ai-recommendations" 
                                className={router.pathname === "/ai-recommendations" ? activeTabClass : inactiveTabClass}
                            >
                                AI Recommendations
                            </Link>
                        </>
                    )}

                    {/* C. GUEST NAVIGATION LINKS */}
                    {!currentUser && (
                        <>
                            <Link 
                                href="/" 
                                className={router.pathname === "/" ? activeTabClass : inactiveTabClass}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/products" 
                                className={router.pathname === "/products" ? activeTabClass : inactiveTabClass}
                            >
                                Market
                            </Link>
                        </>
                    )}
                </div>

                {/* Right Action Icons & Profile Details Area */}
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            {/* FIXED: Hide the live chat shortcut completely for Administrator users [4] */}
                            {currentUser.role !== "admin" && (
                                <Link 
                                    href="/chat" 
                                    className="text-zinc-500 hover:text-lime-600 transition-colors p-2 rounded-full hover:bg-lime-50 focus:outline-none relative"
                                >
                                    <span className="material-symbols-outlined block text-[24px]">chat</span>
                                    {unreadMessages > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#f97316] rounded-full border-2 border-white"></span>
                                    )}
                                </Link>
                            )}

                            {/* Dropdown Container Wrapper */}
                            <div className="relative" ref={dropdownRef}>
                                {/* Profile Pill Button: Toggles the dropdown menu on click [4] */}
                                <button 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    type="button"
                                    className={`flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-full transition-colors text-sm font-medium focus:outline-none cursor-pointer ${
                                        isDropdownOpen || (currentUser.role !== 'admin' && router.pathname === "/profile")
                                            ? "text-lime-700 font-bold ring-2 ring-lime-600/20"
                                            : "text-zinc-700"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-zinc-500 select-none">account_circle</span>
                                    <span>{getDisplayName()}</span>
                                    <span className="material-symbols-outlined text-[18px] text-zinc-400 select-none">
                                        {isDropdownOpen ? "expand_less" : "expand_more"}
                                    </span>
                                </button>

                                {/* Dropdown Menu (Styled matching Stitch AI specifications) [4] */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-[16px] shadow-lg py-2 z-50 animate-enter">
                                        {/* FIXED: Hide profile access entirely for Admin users [4] */}
                                        {currentUser.role !== "admin" && (
                                            <>
                                                <Link 
                                                    href="/profile"
                                                    className="px-4 py-2.5 text-sm text-zinc-700 hover:bg-lime-50/50 hover:text-lime-700 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-zinc-400">person</span>
                                                    My Profile
                                                </Link>
                                                <hr className="border-zinc-100 my-1" />
                                            </>
                                        )}
                                        <Link 
                                            href="/auth/signout"
                                            className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px] text-red-400">logout</span>
                                            Sign Out
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : ( 
                        <>
                            {/* Guest Auth actions */}
                            <Link 
                                href="/auth/signin" 
                                className="text-zinc-600 font-medium hover:text-zinc-900 transition-colors text-sm px-4 py-2"
                            >
                                Sign In
                            </Link>
                            <Link 
                                href="/auth/signup" 
                                className="bg-lime-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-lime-700 transition-colors shadow-sm"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}