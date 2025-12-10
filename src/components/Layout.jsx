import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';
import Logo from "../assets/logo.png";



const Layout = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <img src={Logo} alt="Logo" className="h-6 w-6" />
                        </div>

                        <div className="flex flex-col leading-tight">
                            <span className="font-bold text-xl tracking-tight text-gray-900">
                                Tefa IT Clinic
                            </span>
                            <span className="text-sm text-gray-600 -mt-1">
                                SMK Pratama Mulya Karawang
                            </span>
                        </div>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Link
                            to="/"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!isAdmin
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={18} />
                                Order
                            </div>
                        </Link>
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

            <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
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
