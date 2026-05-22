import { useState } from "react";
import Router from "next/router";
import Link from "next/link";
import useRequest from "../../hooks/use-request";

export default function Signin() {
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        onSuccess: () => Router.push('/')
    });

    // Identity Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [showPassword, setShowPassword] = useState(false);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isFormValid = isEmailValid && password.trim().length >= 6;

    const onSubmitFinal = async (event) => {
        event.preventDefault();
        if (!isFormValid) return;

        const payload = { 
            email: email.trim(), 
            password: password.trim(), 
            role 
        };
        await doRequest(payload);
    };

    return (
        <div className="bg-background min-h-[calc(100vh-56px)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-on-surface">
            
            {/* Scoped CSS for browser autofill overrides and entering animations */}
            <style jsx global>{`
                @keyframes fadeScaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-enter {
                    animation: fadeScaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }

                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #ffffff inset !important;
                    -webkit-text-fill-color: #161d16 !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            {/* Decorative Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-container/20 blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary-container/20 blur-[80px] -z-10 pointer-events-none"></div>

            {/* Main Authentication Card */}
            <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(22,29,22,0.04)] border border-surface-container p-8 relative z-10 animate-enter">
                
                {/* Header */}
                <header className="mb-6">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low text-primary flex items-center justify-center mb-6 shadow-sm border border-surface-container-high">
                        <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                    </div>
                    <h1 className="text-[28px] font-bold tracking-tight text-on-surface mb-2 font-headline">
                        Welcome back to NutriSync
                    </h1>
                    <p className="text-[16px] text-on-surface-variant leading-relaxed">
                        Enter your details to access your personalized feed.
                    </p>
                </header>

                {/* Form */}
                <form className="space-y-5" onSubmit={onSubmitFinal}>
                    
                    {/* Role Segmented Tabs */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-on-surface font-label">Account Type</label>
                        <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
                            <button
                                type="button"
                                onClick={() => setRole('customer')}
                                className={`py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                                    role === 'customer'
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('vendor')}
                                className={`py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none ${
                                    role === 'vendor'
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                            >
                                Vendor
                            </button>
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-on-surface font-label" htmlFor="email">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </div>
                            <input 
                                className="w-full pl-11 pr-4 py-3.5 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-[16px]" 
                                id="email" 
                                name="email" 
                                placeholder="john@example.com" 
                                required 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-[14px] font-semibold text-on-surface font-label" htmlFor="password">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input 
                                className="w-full pl-11 pr-12 py-3.5 bg-surface rounded-lg border border-outline-variant text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-[16px]" 
                                id="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button 
                                aria-label="Toggle password visibility" 
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface-variant focus:outline-none transition-colors" 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px] select-none">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        <div className="flex justify-end pt-1">
                            <a className="text-[14px] font-semibold text-primary hover:text-primary-container transition-colors font-label" href="#">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Error Alerts Block */}
                    {errors && <div className="pt-2">{errors}</div>}

                    {/* Submit Action */}
                    <div className="pt-4">
                        {isFormValid ? (
                            <button 
                                className="w-full bg-primary text-on-primary font-semibold py-4 rounded-lg shadow-[0_4px_14px_0_rgba(0,110,47,0.25)] hover:bg-surface-tint hover:shadow-[0_6px_20px_0_rgba(0,110,47,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none font-label" 
                                type="submit"
                            >
                                Sign In
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button 
                                className="w-full bg-surface-variant text-outline-variant opacity-60 cursor-not-allowed font-semibold py-4 rounded-lg flex items-center justify-center gap-2 font-label" 
                                type="button"
                                disabled
                            >
                                Sign In
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        )}
                    </div>
                </form>

                {/* Footer Links */}
                <div className="mt-8 text-center">
                    <p className="text-[14px] text-on-surface-variant font-body">
                        Don't have an account? 
                        <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary-container transition-colors ml-1 font-label">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}