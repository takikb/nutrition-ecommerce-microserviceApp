import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import axios from "axios";
import { io } from "socket.io-client";

const ChatPage = ({ initialConversations, currentUser }) => {
    const router = useRouter();
    
    // Core state management
    const [conversations, setConversations] = useState(initialConversations || []);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessageText, setNewMessageText] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Infinite Scroll-Up Pagination states [4]
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasNoMoreOlder, setHasNoMoreOlder] = useState(false);

    // Defer date rendering until client mount to prevent timezone mismatches [1]
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll anchors & state refs for viewport stability [4]
    const messagesEndRef = useRef(null);
    const prevFirstMessageIdRef = useRef(null);
    const prevActiveIdRef = useRef(null);

    // 1. Reset pagination boundaries when switching conversations [4]
    useEffect(() => {
        setHasNoMoreOlder(false);
        setMessages([]);
    }, [activeConversation]);

    // 2. Detect conversation ID passed from product navigation to select it instantly [4]
    useEffect(() => {
        if (router.isReady) {
            const { activeId } = router.query;
            if (activeId) {
                const found = conversations.find(c => (c.id || c._id) === activeId);
                if (found) {
                    setActiveConversation(found);
                    // Clear query param cleanly from the URL bar
                    router.replace("/chat", undefined, { shallow: true });
                }
            }
        }
    }, [router.isReady, router.query, conversations]);

    // 3. Fetch initial message history & mark as read on active chat change [4]
    useEffect(() => {
        const fetchMessageHistory = async () => {
            if (!activeConversation) return;

            setLoadingMessages(true);
            const activeId = activeConversation.id || activeConversation._id;

            try {
                const { data } = await axios.get(`/api/chat/messages/${activeId}`);
                setMessages(data);

                // Mark messages as read [4]
                await axios.patch(`/api/chat/conversations/${activeId}/read`);
            } catch (err) {
                console.error("Failed to retrieve message logs:", err.message);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessageHistory();
    }, [activeConversation]);

    // 4. Smart auto-scroll: Snaps down ONLY on new messages or chat swaps [4]
    useEffect(() => {
        if (!activeConversation) return;
        const activeId = activeConversation.id || activeConversation._id;
        const firstMessageId = messages[0]?.id || messages[0]?._id;

        // Trigger scroll if we opened a new chat or if a brand new message arrived at the top
        if (activeId !== prevActiveIdRef.current || firstMessageId !== prevFirstMessageIdRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }

        // Store reference values
        prevActiveIdRef.current = activeId;
        prevFirstMessageIdRef.current = firstMessageId;
    }, [messages, activeConversation]);

    // 5. Socket.io Connection setup with fallback support
    useEffect(() => {
        if (!currentUser) return;

        let token = "";
        if (typeof document !== "undefined") {
            const sessionCookie = document.cookie.split("; ").find(row => row.startsWith("session="));
            if (sessionCookie) {
                const base64Val = sessionCookie.split("=")[1];
                try {
                    const decodedJson = JSON.parse(atob(base64Val));
                    token = decodedJson.jwt;
                } catch (e) {
                    console.error("Failed to parse session cookie:", e);
                }
            }
        }

        const socket = io({
            path: "/api/chat/socket.io",
            auth: {
                token: token
            }
        });

        socket.on("connect", () => {
            console.log("Chat system successfully connected to real-time sync stream");
            socket.emit("joinRoom", currentUser.id);
        });

        socket.on("connect_error", (err) => {
            console.warn("Socket handshake connection error:", err.message);
        });

        socket.on("newMessage", (incomingMessage) => {
            console.log("Live message received via socket:", incomingMessage);
            const activeId = activeConversation?.id || activeConversation?._id;

            if (incomingMessage.conversationId === activeId) {
                setMessages(prev => [incomingMessage, ...prev]);
                axios.patch(`/api/chat/conversations/${activeId}/read`).catch(() => {});
            }

            setConversations(prev => 
                prev.map(c => {
                    const cid = c.id || c._id;
                    if (cid === incomingMessage.conversationId) {
                        return {
                            ...c,
                            lastMessage: incomingMessage.content,
                            lastMessageAt: incomingMessage.createdAt,
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
        });

        return () => {
            socket.disconnect();
        };
    }, [activeConversation, currentUser]);

    // 6. Pagination Loader: Requests older offset-based records [4]
    const loadOlderMessages = async () => {
        if (!activeConversation || loadingOlder || hasNoMoreOlder) return;

        setLoadingOlder(true);
        const activeId = activeConversation.id || activeConversation._id;
        const skip = messages.length;

        try {
            const { data } = await axios.get(`/api/chat/messages/${activeId}?limit=50&skip=${skip}`);
            
            if (data.length < 50) {
                setHasNoMoreOlder(true); // Stop subsequent calls if no more records [4]
            }

            // Append older messages to the bottom/end of the array [4]
            setMessages(prev => [...prev, ...data]);
        } catch (err) {
            console.error("Failed to load older messages:", err.message);
        } finally {
            setLoadingOlder(false);
        }
    };

    // 7. Scroll Listener: Detects top-scroll to trigger pagination [4]
    const handleScroll = (e) => {
        const { scrollTop } = e.currentTarget;
        if (scrollTop === 0 && messages.length >= 50 && !hasNoMoreOlder && !loadingOlder) {
            loadOlderMessages();
        }
    };

    // 8. Submit Message Form Action Handler
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessageText.trim() || !activeConversation) return;

        const activeId = activeConversation.id || activeConversation._id;
        const tempText = newMessageText;
        setNewMessageText("");

        try {
            const { data: sentMessage } = await axios.post("/api/chat/messages", {
                conversationId: activeId,
                content: tempText
            });

            setMessages(prev => [sentMessage, ...prev]);

            setConversations(prev =>
                prev.map(c => {
                    const cid = c.id || c._id;
                    if (cid === activeId) {
                        return {
                            ...c,
                            lastMessage: tempText,
                            lastMessageAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
        } catch (err) {
            console.error("Message dispatch failure:", err.message);
        }
    };

    // Helper: Dynamic Chat Partner Name Extractor (Handles Buyer/Vendor perspective) [4]
    const getChatPartnerName = (conv) => {
        if (!conv || !currentUser) return "Support Chat";
        const customer = conv.customerId;
        const vendor = conv.vendorId;
        
        const customerIdStr = customer && typeof customer === "object" ? (customer.id || customer._id) : customer;
        const isCustomerMe = customerIdStr === currentUser.id;

        if (isCustomerMe) {
            return (vendor && typeof vendor === "object") ? vendor.fullName : "GhidhAI Merchant";
        } else {
            return (customer && typeof customer === "object") ? customer.fullName : "Active Member";
        }
    };

    // Helper functions for formatting & initials
    const getInitials = (name) => {
        if (!name) return "GO";
        return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const formatTimestamp = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Sidebar search filter calculation
    const filteredConversations = conversations.filter(c => {
        const titleMatch = c.productTitle?.toLowerCase().includes(searchQuery.toLowerCase());
        const partnerName = getChatPartnerName(c).toLowerCase();
        return titleMatch || partnerName.includes(searchQuery.toLowerCase()) || searchQuery === "";
    });

    const chronologicalMessages = [...messages].reverse();

    // Defensively extract the product context image from the populated replica [4]
    const activeProductImage = activeConversation && typeof activeConversation.productId === "object"
        ? activeConversation.productId?.images?.[0]
        : null;

    return (
        <div className="bg-[#fdf8f3] text-on-surface min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4 md:p-gutter">
                {/* FIXED: Height adjusted to 220px to prevent viewport overflow [1] */}
                <div className="w-full max-w-6xl h-[calc(100vh-220px)] bg-surface-container-lowest rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-surface-variant overflow-hidden grid grid-cols-1 md:grid-cols-12">
                    
                    {/* Sidebar Conversation List */}
                    <div className={`col-span-1 md:col-span-4 border-r border-surface-variant flex flex-col bg-surface-bright h-full ${
                        activeConversation ? "hidden md:flex" : "flex"
                    }`}>
                        <div className="p-6 border-b border-surface-variant">
                            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Messages</h2>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                                <input 
                                    className="w-full bg-surface-container-low border border-surface-variant rounded-[12px] py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all placeholder:text-outline-variant" 
                                    placeholder="Search messages..." 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* List Items Container */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-2">
                            {filteredConversations.length === 0 ? (
                                <div className="p-4 text-center text-zinc-400 text-sm font-body-md">
                                    No active messages.
                                </div>
                            ) : (
                                filteredConversations.map((c) => {
                                    const cid = c.id || c._id;
                                    const isActive = activeConversation && (activeConversation.id || activeConversation._id) === cid;
                                    
                                    const partnerName = getChatPartnerName(c);
                                    const initials = getInitials(partnerName);

                                    return (
                                        <div 
                                            key={cid}
                                            onClick={() => setActiveConversation(c)}
                                            className={`p-4 rounded-[16px] cursor-pointer flex items-center gap-4 transition-colors ${
                                                isActive 
                                                    ? "bg-primary-container/10 border border-primary-container/20" 
                                                    : "hover:bg-surface-container-low border border-transparent"
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-[#ecfccb] flex items-center justify-center text-primary-container font-headline-md select-none">
                                                    {initials}
                                                </div>
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-label-md text-label-md text-on-surface truncate">
                                                        {partnerName}
                                                    </h3>
                                                    {/* FIXED: Hydration Timezone Protector [1] */}
                                                    <span className="text-xs text-outline font-label-sm">
                                                        {mounted ? formatTimestamp(c.lastMessageAt || c.updatedAt) : ""}
                                                    </span>
                                                </div>
                                                <p className="font-body-md text-[13px] text-zinc-500 truncate mb-0.5">
                                                    Context: {c.productTitle}
                                                </p>
                                                <p className="font-body-md text-[14px] text-on-surface-variant truncate font-semibold">
                                                    {c.lastMessage || "Start discussion..."}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Active Chat Window Area */}
                    <div className={`col-span-1 md:col-span-8 flex flex-col h-full bg-[#faf9fa] ${
                        activeConversation ? "flex" : "hidden md:flex items-center justify-center text-zinc-400 font-body-md"
                    }`}>
                        {activeConversation ? (
                            <>
                                {/* Chat Window Header */}
                                <div className="px-8 py-4 border-b border-surface-variant bg-surface-container-lowest flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setActiveConversation(null)} 
                                            className="md:hidden text-zinc-500 hover:text-primary mr-1 focus:outline-none"
                                        >
                                            <span className="material-symbols-outlined block">arrow_back</span>
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-[#ecfccb] flex items-center justify-center text-primary-container font-label-md select-none">
                                            {getInitials(getChatPartnerName(activeConversation))}
                                        </div>
                                        <div>
                                            <h2 className="font-label-md text-label-md text-on-surface">
                                                {getChatPartnerName(activeConversation)}
                                            </h2>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <div className="w-2 h-2 rounded-full bg-primary-container"></div>
                                                <span className="text-[12px] text-outline font-label-sm">Active Channel</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Scroll Block (min-h-0 and onScroll handler configured for pagination) [4] */}
                                <div 
                                    onScroll={handleScroll}
                                    className="flex-grow overflow-y-auto min-h-0 p-6 md:p-8 flex flex-col gap-6"
                                >
                                    {/* Scroll-Up Loading Indicator [4] */}
                                    {loadingOlder && (
                                        <div className="text-center py-2 text-xs text-zinc-400 flex items-center justify-center gap-2">
                                            <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                                            Loading older messages...
                                        </div>
                                    )}

                                    {/* Dynamic Inquiry Context Card (Type-safe optional chains guard against strings) [4] */}
                                    {activeConversation.productId && (
                                        <div className="mx-auto w-full max-w-md bg-[#fffbeb] border border-[#fde68a] rounded-[16px] p-4 flex gap-4 items-center shadow-sm mb-4">
                                            {activeProductImage ? (
                                                <img 
                                                    alt={activeConversation.productTitle} 
                                                    className="w-16 h-16 rounded-[8px] object-cover border border-[#fde68a]" 
                                                    src={activeProductImage} 
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-lg bg-[#fef3c7] flex items-center justify-center text-secondary font-bold text-lg select-none">
                                                    🍲
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-[11px] font-label-sm text-secondary uppercase tracking-wider mb-0.5">Inquiry context</div>
                                                <div className="font-label-md text-label-md text-on-secondary-fixed">
                                                    {activeConversation.productTitle}
                                                </div>
                                                <div className="font-body-md text-[14px] text-secondary mt-0.5">
                                                    {Number(activeConversation.productPrice || 0).toLocaleString()} DZD
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scrollable messages chronological stream */}
                                    {loadingMessages ? (
                                        <div className="flex-grow flex items-center justify-center gap-2 text-zinc-400">
                                            <span className="animate-spin material-symbols-outlined">sync</span> Loading history...
                                        </div>
                                    ) : (
                                        chronologicalMessages.map((msg) => {
                                            const isMe = msg.senderId === currentUser.id;
                                            
                                            return (
                                                <div 
                                                    key={msg.id || msg._id} 
                                                    className={`flex gap-4 max-w-[80%] ${isMe ? "self-end flex-row-reverse" : "self-start"}`}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-surface-variant flex-shrink-0 flex items-center justify-center text-[11px] font-bold select-none">
                                                        {isMe ? "ME" : "VN"}
                                                    </div>
                                                    <div className={`px-5 py-3 shadow-sm rounded-[16px] ${
                                                        isMe 
                                                            ? "bg-primary-container text-on-primary rounded-tr-none" 
                                                            : "bg-surface-container-lowest border border-surface-variant rounded-tl-none"
                                                    }`}>
                                                        <p className="font-body-md text-body-md whitespace-pre-wrap">{msg.content}</p>
                                                        {/* FIXED: Hydration Timezone Protector [1] */}
                                                        <span className={`text-[10px] block mt-1 text-right ${isMe ? "text-[#e4e4e7]" : "text-outline"}`}>
                                                            {mounted ? formatTimestamp(msg.createdAt) : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Active Input Bar Form */}
                                <form onSubmit={handleSendMessage} className="p-6 bg-surface-container-lowest border-t border-surface-variant">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            className="flex-grow bg-surface-container-low border border-surface-variant rounded-full py-3 px-6 font-body-md text-body-md focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                                            placeholder="Type a message..." 
                                            type="text"
                                            value={newMessageText}
                                            onChange={(e) => setNewMessageText(e.target.value)}
                                        />
                                        <button 
                                            type="submit"
                                            className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-[#4d7c0f] shadow-sm transition-colors flex-shrink-0 focus:outline-none"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="text-center p-8 select-none">
                                <span className="material-symbols-outlined text-6xl mb-4 text-zinc-300">chat_bubble</span>
                                <p>Select a message channel to begin your live inquiry.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

// Next.js Server-Side pre-fetcher aggregated with authentication redirects
ChatPage.getInitialProps = async (context, client, currentUser) => {
    if (!currentUser) {
        if (context.res) {
            context.res.writeHead(302, { Location: "/auth/signin" });
            context.res.end();
        } else {
            Router.push("/auth/signin");
        }
        return { initialConversations: [], currentUser: null };
    }

    try {
        const { data } = await client.get("/api/chat/conversations");
        return { initialConversations: data, currentUser };
    } catch (err) {
        console.error("SSR Conversation pre-load failure:", err.message);
        return { initialConversations: [], currentUser };
    }
};

export default ChatPage;