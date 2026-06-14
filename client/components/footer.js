import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-200 pt-16 pb-8 px-8 mt-12 w-full">
            <div className="max-w-container-max mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    
                    {/* Col 1: Brand details */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2 text-lime-700 font-bold text-xl cursor-pointer">
                            <span className="material-symbols-outlined text-lime-700 select-none">eco</span>
                            <span className="font-headline font-bold text-lime-700 text-xl tracking-tight">GhidhAI</span>
                        </Link>
                        <p className="text-zinc-500 font-body-md text-sm leading-relaxed">
                            Smart nutrition, designed for you. The premier AI-powered healthy food marketplace.
                        </p>
                    </div>

                    {/* Col 2: Platform Links */}
                    <div>
                        <h4 className="text-zinc-900 font-label-md text-sm font-bold mb-4 uppercase tracking-wider">Platform</h4>
                        <ul className="flex flex-col gap-3">
                            <li>
                                <Link href="/products" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    The Kitchen
                                </Link>
                            </li>
                            <li>
                                <Link href="/ai-recommendations" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    How our AI Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Support Links */}
                    <div>
                        <h4 className="text-zinc-900 font-label-md text-sm font-bold mb-4 uppercase tracking-wider">Support</h4>
                        <ul className="flex flex-col gap-3">
                            <li>
                                <Link href="/support" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/signup" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    Become a Vendor
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Legal Information */}
                    <div>
                        <h4 className="text-zinc-900 font-label-md text-sm font-bold mb-4 uppercase tracking-wider">Legal</h4>
                        <ul className="flex flex-col gap-3">
                            <li>
                                <Link href="/legal/terms" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/vendor-agreement" className="text-zinc-500 hover:text-lime-600 transition-colors font-body-md text-sm">
                                    Vendor Agreement
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Copyright and Social Links Section */}
                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-400 font-label-sm text-xs select-none">
                        © {new Date().getFullYear()} GhidhAI. All rights reserved.
                    </p>
                    
                    <div className="flex gap-6">
                        {/* Instagram */}
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-lime-600 transition-colors" aria-label="GhidhAI Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram w-5 h-5 cursor-pointer">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                            </svg>
                        </a>

                        {/* Facebook */}
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-lime-600 transition-colors" aria-label="GhidhAI Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook w-5 h-5 cursor-pointer">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                        </a>

                        {/* Twitter/X */}
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-lime-600 transition-colors" aria-label="GhidhAI Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter w-5 h-5 cursor-pointer">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                            </svg>
                        </a>

                        {/* LinkedIn */}
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-lime-600 transition-colors" aria-label="GhidhAI LinkedIn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin w-5 h-5 cursor-pointer">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect width="4" height="12" x="2" y="9"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}