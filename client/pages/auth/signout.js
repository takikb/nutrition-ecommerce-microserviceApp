import { useEffect } from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

export default function Signout() {
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        onSuccess: () => Router.push('/'),
    });

    useEffect(() => {
        doRequest({});
    }, []);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-margin-mobile md:p-gutter">
            <main className="w-full max-w-sm bg-surface-container-lowest rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-8 text-center">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="material-symbols-outlined text-primary text-3xl">logout</span>
                </div>
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Signing you out…</h1>
                <p className="font-body-md text-body-md text-on-surface-variant">You&apos;ll be redirected in a moment.</p>
            </main>
        </div>
    );
}
