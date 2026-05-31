import { useState } from "react";
import Router from "next/router";
import Link from "next/link";
import useRequest from "../../hooks/use-request";

export default function Signin() {
    const [touchedFields, setTouchedFields] = useState({});

    // 🚀 DYNAMIC REDIRECT ON SUCCESS BASED ON BACKEND RESPONSE ROLE
    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        onSuccess: (user) => {
            if (user.role === 'admin') {
                Router.push('/admin/audit');
            } else if (user.role === 'vendor') {
                Router.push('/vendor/products');
            } else {
                Router.push('/'); // Customers go to the landing page
            }
        }
    });

    // Identity Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleBlur = (fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    };

    const trimmedEmail = email.trim().toLowerCase();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const trimmedPassword = password.trim();

    const isPasswordValid = trimmedPassword.length >= 6 && trimmedPassword.length <= 20;
    const isFormValid = isEmailValid && isPasswordValid;

    const onSubmitFinal = async (event) => {
        event.preventDefault();
        if (!isFormValid) {
            setTouchedFields({ email: true, password: true });
            return;
        }

        await doRequest({ 
            email: trimmedEmail, 
            password: trimmedPassword
        });
    };

    return (
        <div className="bg-orange-50/50 min-h-[calc(100vh-56px)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-900">
            
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
                    -webkit-text-fill-color: #18181b !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>

            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-lime-200/20 blur-[100px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-yellow-200/20 blur-[80px] -z-10 pointer-events-none"></div>

            {/* Main Authentication Card */}
            <main className="w-full max-w-md bg-white rounded-xl shadow-[0_8px_30px_rgb(24,24,27,0.04)] border border-zinc-200 p-8 relative z-10 animate-enter">
                
                {/* Header */}
                <header className="mb-8">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 text-lime-600 flex items-center justify-center mb-6 shadow-sm border border-zinc-200">
                        <span className="material-symbols-outlined select-none" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                    </div>
                    <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 mb-2 font-headline">
                        Welcome back to GhidhAI
                    </h1>
                    <p className="text-[16px] text-zinc-700 leading-relaxed font-body">
                        Enter your details to access your personalized feed.
                    </p>
                </header>

                {/* Form */}
                <form className="space-y-5" onSubmit={onSubmitFinal}>
                    
                    {/* 🚀 ROLE TABS REMOVED FROM HERE FOR MAXIMUM UX & SECURITY */}

                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-[14px] font-semibold text-zinc-900 font-label" htmlFor="email">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-lime-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </div>
                            <input 
                                className={`w-full pl-11 pr-4 py-3.5 bg-zinc-100 rounded-lg border text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-lime-600 focus:ring-2 focus:ring-lime-600/20 transition-all outline-none text-[16px] font-body ${
                                    touchedFields.email && !isEmailValid ? 'border-red-300' : 'border-zinc-300'
                                }`} 
                                id="email" 
                                name="email" 
                                placeholder="john@example.com" 
                                required 
                                type="email"
                                value={email}
                                onBlur={() => handleBlur('email')}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        {touchedFields.email && !isEmailValid && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span> Please enter a valid email format.
                            </p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-[14px] font-semibold text-zinc-900 font-label" htmlFor="password">Password</label>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-lime-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                            <input 
                                className={`w-full pl-11 pr-12 py-3.5 bg-zinc-100 rounded-lg border text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-lime-600 focus:ring-2 focus:ring-lime-600/20 transition-all outline-none text-[16px] font-body ${
                                    touchedFields.password && !isPasswordValid ? 'border-red-300' : 'border-zinc-300'
                                }`} 
                                id="password" 
                                name="password" 
                                placeholder="••••••••" 
                                required 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onBlur={() => handleBlur('password')}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button 
                                aria-label="Toggle password visibility" 
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-700 focus:outline-none transition-colors" 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <span className="material-symbols-outlined text-[20px] select-none">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        {touchedFields.password && !isPasswordValid && (
                            <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">error</span> Password must be between 6 and 20 characters.
                            </p>
                        )}
                        <div className="flex justify-end pt-1">
                            <a className="text-[14px] font-semibold text-lime-600 hover:text-lime-700 transition-colors font-label" href="#">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {/* Server Request Errors */}
                    {errors && <div className="pt-2">{errors}</div>}

                    {/* Submit Action */}
                    <div className="pt-6">
                        {isFormValid ? (
                            <button 
                                className="w-full bg-lime-600 text-white font-semibold py-4 rounded-lg shadow-[0_4px_14px_0_rgba(101,163,13,0.25)] hover:bg-lime-700 hover:shadow-[0_6px_20px_0_rgba(101,163,13,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none text-[16px] font-label" 
                                type="submit"
                            >
                                Sign In
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button 
                                className="w-full bg-zinc-100 text-zinc-400 cursor-not-allowed font-semibold py-4 rounded-lg flex items-center justify-center gap-2 font-label" 
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
                    <p className="text-[14px] text-zinc-700 font-body">
                        Don't have an account? 
                        <Link href="/auth/signup" className="font-semibold text-lime-600 hover:text-lime-700 transition-colors ml-1 font-label">
                            Sign up
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}