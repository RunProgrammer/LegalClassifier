import { Link } from 'react-router-dom';

function Nav() {
    return (
        <div className="w-full fixed top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-sans font-bold flex items-center gap-2">
                    <span className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white text-lg shadow-lg shadow-amber-900/20">LC</span>
                    <span className="tracking-tight">LegalClassifier</span>
                </Link>
                <ul className="flex gap-8 text-slate-300 font-medium">
                    <li>
                        <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
                    </li>
                    <li>
                        <Link to="/app" className="hover:text-amber-500 transition-colors">App</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Nav;