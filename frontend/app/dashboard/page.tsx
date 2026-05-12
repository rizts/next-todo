"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
    const { data: session, isPending, error } = authClient.useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Debugging logs
    console.log("Dashboard State:", { session, isPending, error });

    useEffect(() => {
        if (!isPending && !session) {
            console.log("No session found, redirecting to login...");
            router.push("/login");
        }
    }, [session, isPending, router]);

    const handleSignOut = async () => {
        setLoading(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
        setLoading(false);
    };

    const handleAddPasskey = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const { error: passkeyError } = await authClient.passkey.addPasskey({
                name: `Passkey-${new Date().toLocaleDateString()}`,
            });
            if (passkeyError) {
                setMessage({ type: 'error', text: passkeyError.message || "Failed to add passkey" });
            } else {
                setMessage({ type: 'success', text: "Passkey added successfully! You can now use it to login." });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An unexpected error occurred" });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-sm animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <p className="text-gray-500">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">TodoApp</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block border-r pr-6 mr-2 border-gray-200">
                                <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
                                <p className="text-xs text-gray-500">{session.user.email}</p>
                            </div>
                            <button
                                onClick={handleSignOut}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 shadow-sm"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8">
                    {/* Welcome Section */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-2xl p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Welcome back, {session.user.name.split(' ')[0]}! 👋
                                </h3>
                                <p className="mt-1 text-gray-500">
                                    Manage your tasks and secure your account.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleAddPasskey}
                                    disabled={loading}
                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm disabled:opacity-50"
                                >
                                    Register Passkey (WebAuthn)
                                </button>
                                <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-bold">Security Enhancement</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`mt-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}
                    </div>

                    {/* Content Placeholder */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-2xl">
                        <div className="px-4 py-5 sm:px-8 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Your Todos</h3>
                        </div>
                        <div className="px-8 py-20 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h4 className="text-gray-900 font-semibold mb-1">No todos yet</h4>
                            <p className="text-gray-500 max-w-sm">Start by adding your first task below.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
