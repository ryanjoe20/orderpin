import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';
import Logo from "../assets/logo.png";
import { useDarkMode } from '../context/DarkModeContext';



const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <img src={Logo} alt="Logo" className="h-6 w-6" />
                        </div>

                        <div className="flex flex-col leading-tight">
                            <span className={`font-bold text-xl tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                TEFA IT Clinic
                            </span>
                            <span className={`text-sm -mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                SMK Pratama Mulya Karawang
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!isAdmin
                                ? (isDarkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-50 text-indigo-700')
                                : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100')
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={18} />
                                Order
                            </div>
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className={`w-10 h-10 rounded-full font-medium transition-all flex items-center justify-center ${isDarkMode
                                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            title="Toggle Dark Mode"
                        >
                            {isDarkMode ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                        {/* Admin link hidden as requested */}
                        {/*
                        <Link
                            to="/admin"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isAdmin
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <LayoutDashboard size={18} />
                                Admin
                            </div>
                        </Link>
                        */}
                    </nav>
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {children}
            </main>

            <footer className={`border-t py-8 text-center text-sm transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                <p>
                    &copy; {new Date().getFullYear()} Pin order by{' '}
                    <a
                        href="https://instagram.com/20ryannugraha"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        20ryannugraha
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default Layout;
