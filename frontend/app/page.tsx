import Link from "next/link";
import { ClipboardList, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6 text-gray-900">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Icon/Logo */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                        <ClipboardList className="w-8 h-8" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Modern Todo Application
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                        A clean and secure task management system built with 
                        Next.js and FastAPI. Simplify your workflow and stay focused on what matters.
                    </p>
                </div>

                {/* Features (Simple Icons) */}
                <div className="flex justify-center gap-8 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        Secure Auth
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                        <Zap className="w-4 h-4 text-orange-400" />
                        Fast Sync
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                    <Link 
                        href="/login" 
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Footer Tag */}
                <div className="pt-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                        Full-Stack Learning Project
                    </span>
                </div>
            </div>
        </div>
    );
}
