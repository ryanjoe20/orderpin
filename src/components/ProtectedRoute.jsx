import { useState, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const authStatus = localStorage.getItem('admin_auth');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple hardcoded password
        if (password === 'admin123') {
            localStorage.setItem('admin_auth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Password salah!');
            setPassword('');
        }
    };

    if (isLoading) {
        return null; // or a loading spinner
    }

    if (isAuthenticated) {
        return children;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 animate-fade-in-up">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
                    <p className="text-gray-500 text-sm">Masukan password untuk mengakses dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Masukan Password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            autoFocus
                        />
                        {error && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        Masuk
                        <ArrowRight size={18} />
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">Password Hint: <strong>abcd</strong></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProtectedRoute;
