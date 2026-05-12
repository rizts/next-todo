"use client";

import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
    CheckCircle2, 
    Circle, 
    Plus, 
    Trash2, 
    LogOut, 
    Fingerprint, 
    Loader2,
    ClipboardList,
    User
} from "lucide-react";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    created_at: string;
}

export default function DashboardPage() {
    const { data: session, isPending, error } = authClient.useSession();
    const router = useRouter();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");

    // Fetch Todos
    const fetchTodos = async () => {
        try {
            const data = await apiRequest("/todos/");
            setTodos(data);
        } catch (err) {
            console.error("Failed to fetch todos:", err);
            toast.error("Failed to load your tasks");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login");
        } else if (session) {
            fetchTodos();
        }
    }, [session, isPending, router]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        setIsActionLoading(true);
        const promise = apiRequest("/todos/", {
            method: "POST",
            body: JSON.stringify({ title: newTodo }),
        });

        toast.promise(promise, {
            loading: 'Creating task...',
            success: (addedTodo) => {
                setTodos([addedTodo, ...todos]);
                setNewTodo("");
                return `Task "${addedTodo.title}" created`;
            },
            error: 'Could not create task',
            finally: () => setIsActionLoading(false)
        });
    };

    const toggleTodo = async (todo: Todo) => {
        try {
            const updated = await apiRequest(`/todos/${todo.id}`, {
                method: "PATCH",
                body: JSON.stringify({ completed: !todo.completed }),
            });
            setTodos(todos.map(t => t.id === todo.id ? updated : t));
            toast.success(updated.completed ? "Task completed" : "Task reopened");
        } catch (err) {
            toast.error("Failed to update task");
        }
    };

    const deleteTodo = async (id: number) => {
        const todoToDelete = todos.find(t => t.id === id);
        try {
            await apiRequest(`/todos/${id}`, { method: "DELETE" });
            setTodos(todos.filter(t => t.id !== id));
            toast.success(`Task deleted`);
        } catch (err) {
            toast.error("Failed to delete task");
        }
    };

    const handleSignOut = async () => {
        setIsActionLoading(true);
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Signed out successfully");
                    router.push("/login");
                },
                onError: () => {
                    toast.error("Failed to sign out");
                    setIsActionLoading(false);
                }
            },
        });
    };

    const handleAddPasskey = async () => {
        setIsActionLoading(true);
        try {
            const { error: passkeyError } = await authClient.passkey.addPasskey({
                name: `Passkey-${new Date().toLocaleDateString()}`,
            });
            if (passkeyError) {
                toast.error(passkeyError.message || "Failed to add passkey");
            } else {
                toast.success("Passkey added successfully! You can now login using biometrics.");
            }
        } catch (err) {
            toast.error("An unexpected error occurred while adding passkey");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Setting up your space...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-12">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">TodoApp</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-3 border-r pr-6 border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-900 leading-none mb-1">{session.user.name}</p>
                                    <p className="text-[10px] text-gray-400 leading-none">{session.user.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSignOut}
                                disabled={isActionLoading}
                                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto py-12 px-4">
                <div className="space-y-8">
                    {/* Welcome Section */}
                    <div className="bg-white shadow-xl shadow-gray-100/50 border border-gray-100 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">
                                Hello, {session.user.name.split(' ')[0]}!
                            </h3>
                            <p className="text-gray-500 font-medium">You have {todos.filter(t => !t.completed).length} pending tasks today.</p>
                        </div>
                        <button
                            onClick={handleAddPasskey}
                            disabled={isActionLoading}
                            className="relative z-10 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-2xl border border-blue-100/50 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                            Enable Passkey Security
                        </button>
                    </div>

                    {/* Add Todo Form */}
                    <form onSubmit={handleAddTodo} className="relative group">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            placeholder="What's your focus today?"
                            disabled={isActionLoading}
                            className="w-full pl-6 pr-20 py-5 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-lg shadow-gray-100/50 text-gray-700 placeholder:text-gray-300 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={isActionLoading || !newTodo.trim()}
                            className="absolute right-2 top-2 bottom-2 px-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
                        </button>
                    </form>

                    {/* Todo List */}
                    <div className="bg-white shadow-xl shadow-gray-100/50 border border-gray-100 rounded-3xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <h4 className="font-black text-gray-900 tracking-tight">Your Journey</h4>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-400 shadow-sm">
                                    {todos.length} TASKS
                                </span>
                            </div>
                        </div>
                        
                        {isFetching ? (
                            <div className="py-20 flex flex-col items-center gap-3">
                                <Loader2 className="w-8 h-8 text-blue-100 animate-spin" />
                                <p className="text-xs font-bold text-gray-200 uppercase tracking-widest">Loading your flow</p>
                            </div>
                        ) : todos.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12 group hover:rotate-0 transition-transform duration-500">
                                    <ClipboardList className="w-10 h-10 text-gray-200" />
                                </div>
                                <h5 className="text-lg font-bold text-gray-900 mb-1">Clear Horizon</h5>
                                <p className="text-gray-400 text-sm font-medium">Your task list is empty. Time to start fresh!</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {todos.map((todo) => (
                                    <li key={todo.id} className="px-8 py-5 flex items-center justify-between group hover:bg-blue-50/30 transition-all duration-300">
                                        <div className="flex items-center gap-5 flex-1">
                                            <button
                                                onClick={() => toggleTodo(todo)}
                                                className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 transform active:scale-75 ${
                                                    todo.completed 
                                                    ? 'bg-green-500 border-green-500 shadow-lg shadow-green-100' 
                                                    : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                                                }`}
                                            >
                                                {todo.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-100 group-hover:text-blue-100" strokeWidth={3} />
                                                )}
                                            </button>
                                            <span className={`text-gray-700 font-bold transition-all duration-500 ${todo.completed ? 'line-through text-gray-300 italic' : ''}`}>
                                                {todo.title}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            className="opacity-0 group-hover:opacity-100 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
