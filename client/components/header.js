import Link from "next/link";

export default ({ currentUser }) => {
    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
        .filter(Boolean)
        .map(({ label, href }) => (
            <li key={href}>
                <Link
                    href={href}
                    className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-3 py-2"
                >
                    {label}
                </Link>
            </li>
        ));

    return (
        <nav className="bg-surface-container-lowest border-b border-outline-variant/30 px-margin-mobile md:px-gutter py-3 flex items-center justify-between">
            <Link
                href="/"
                className="flex items-center gap-2 font-headline-md text-headline-md text-primary"
            >
                <span className="material-symbols-outlined text-primary text-2xl">eco</span>
                NutriSync
            </Link>
            <ul className="flex items-center gap-2 list-none m-0 p-0">
                {links}
            </ul>
        </nav>
    );
};
