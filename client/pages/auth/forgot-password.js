import { useState } from "react";
import Link from "next/link";
import useRequest from "../../hooks/use-request";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { doRequest, errors } = useRequest({
        url: "/api/users/forgot-password",
        method: "post",
        body: { email },
        onSuccess: (data) => setSuccessMessage(data.message)
    });

    const onSubmit = (e) => {
        e.preventDefault();
        doRequest();
    };

    return (
        <div className="bg-orange-50/50 min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900">
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-lime-200/20 blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-yellow-200/20 blur-[80px] -z-10 pointer-events-none"></div>

            <main className="w-full max-w-md bg-white rounded-[24px] shadow-lg border border-zinc-200 p-6 md:p-10 relative z-10 animate-enter">
                <header className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-lime-600 text-3xl">lock_reset</span>
                    </div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-zinc-900 mb-2">Forgot Password?</h1>
                    <p className="font-body text-sm text-zinc-500 leading-relaxed">
                        Enter your email address below and we will send you a secure recovery link.
                    </p>
                </header>

                {successMessage ? (
                    <div className="bg-lime-50 border border-lime-200 rounded-2xl p-5 text-center space-y-4 animate-enter">
                        <span className="material-symbols-outlined text-lime-600 text-4xl">mark_email_read</span>
                        <p className="text-sm font-semibold text-lime-900 leading-relaxed">
                            {successMessage}
                        </p>
                        <Link href="/auth/signin" className="block text-xs font-bold text-lime-700 hover:underline">
                            Back to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-lime-600 transition-colors">mail</span>
                                </div>
                                <input 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-lime-600 focus:border-transparent outline-none transition-all text-sm text-zinc-900 font-body" 
                                    placeholder="john@example.com" 
                                    required 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {errors && <div className="animate-enter">{errors}</div>}

                        <button 
                            type="submit" 
                            className="w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm focus:outline-none text-sm"
                        >
                            Send Recovery Link
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/auth/signin" className="text-xs font-bold text-zinc-500 hover:text-lime-700 transition-colors">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}