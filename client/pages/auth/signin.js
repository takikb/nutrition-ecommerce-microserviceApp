import { useState } from "react";
import Router from "next/router";
import Link from "next/link";
import useRequest from "../../hooks/use-request";

export default function Signin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');

    const { doRequest, errors } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        onSuccess: () => Router.push('/')
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        await doRequest({ email, password, role });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile md:p-gutter">
            <main className="w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 md:p-10">
                <header className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Welcome back</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue to NutriSync.</p>
                </header>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="relative group">
                        <label className="sr-only" htmlFor="email">Email Address</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                        </div>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-body-md text-on-surface placeholder-outline"
                        />
                    </div>

                    <div className="relative group">
                        <label className="sr-only" htmlFor="password">Password</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-body-md text-body-md text-on-surface placeholder-outline"
                        />
                        <button
                            type="button"
                            aria-label="Toggle password visibility"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>

                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1.5">Sign in as</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['customer', 'vendor'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`flex items-center justify-center py-3 rounded-lg transition-colors capitalize ${
                                        role === r
                                            ? 'border-2 border-primary bg-surface-container-low ring-2 ring-primary/20'
                                            : 'border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'
                                    }`}
                                >
                                    <span className={`font-label-md text-label-md ${role === r ? 'text-primary' : 'text-on-surface-variant'}`}>
                                        {r === 'customer' ? 'Personal' : 'Vendor'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {errors && (
                        <div className="p-4 rounded-xl bg-error-container border border-error/30 text-on-error-container">
                            {errors}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-on-primary-container text-on-primary font-label-md text-label-md py-4 rounded-xl flex items-center justify-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20"
                    >
                        Sign In
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>

                    <p className="text-center font-body-md text-body-md text-on-surface-variant">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/signup" className="text-primary hover:underline font-label-md text-label-md">
                            Sign up
                        </Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
