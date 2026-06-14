import { useState, useEffect } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import useRequest from "../../hooks/use-request";

export default function ResetPassword() {
    const router = useRouter();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [success, setSuccess] = useState(false);

    // Capture token from query param on load
    useEffect(() => {
        if (router.isReady) {
            const { token: urlToken } = router.query;
            if (urlToken) {
                setToken(urlToken);
            }
        }
    }, [router.isReady, router.query]);

    const { doRequest, errors } = useRequest({
        url: "/api/users/reset-password",
        method: "post",
        body: { token, password },
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => Router.push("/auth/signin"), 4000);
        }
    });

    const isMatch = password === confirmPassword && password.trim().length >= 6;

    const onSubmit = (e) => {
        e.preventDefault();
        if (!isMatch) return;
        doRequest();
    };

    return (
        <div className="bg-orange-50/50 min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-lime-200/20 blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-yellow-200/20 blur-[80px] -z-10 pointer-events-none"></div>

            <main className="w-full max-w-md bg-white rounded-[24px] shadow-lg border border-zinc-200 p-6 md:p-10 relative z-10 animate-enter">
                <header className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-lime-600 text-3xl">key</span>
                    </div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-zinc-900 mb-2">Reset Password</h1>
                    <p className="font-body text-sm text-zinc-500 leading-relaxed">
                        Enter your new password below.
                    </p>
                </header>

                {success ? (
                    <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 text-center space-y-4 animate-enter">
                        <span className="material-symbols-outlined text-lime-600 text-4xl">check_circle</span>
                        <p className="text-sm font-semibold text-lime-900 leading-relaxed">
                            Password updated successfully! Redirecting you to sign in...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                        
                        {/* New Password */}
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">lock</span>
                                </div>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-sm text-zinc-900 font-body" 
                                    placeholder="New Password (min 6 chars)" 
                                    required 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">lock</span>
                                </div>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-sm text-zinc-900 font-body" 
                                    placeholder="Confirm New Password" 
                                    required 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-body">
                                    <span className="material-symbols-outlined text-sm">error</span> Passwords do not match.
                                </p>
                            )}
                        </div>

                        {errors && <div className="animate-enter">{errors}</div>}

                        {isMatch ? (
                            <button 
                                type="submit" 
                                className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm focus:outline-none text-sm"
                            >
                                Reset Password
                            </button>
                        ) : (
                            <button 
                                type="button"
                                disabled
                                className="w-full bg-zinc-100 text-zinc-400 font-semibold py-3.5 rounded-xl cursor-not-allowed text-sm"
                            >
                                Reset Password
                            </button>
                        )}
                    </form>
                )}
            </main>
        </div>
    );
}