import { NavLink, Link } from 'react-router-dom';

export default function Header() {
    const linkClass = ({ isActive }) =>
        `transition-colors duration-200 ${
            isActive ? 'text-[#0B132B] text-lg font-semibold' : 'text-gray-500 text-lg hover:text-[#0B132B]'
        }`;

    return (
        <header className="w-full h-24 bg-[#F2F4F7]/80 backdrop-blur-md flex items-center justify-between px-8 lg:px-16 sticky top-0 z-50 transition-all">
            <div className="flex-shrink-0">
                <Link to="/">
                    <img
                        src="../src/assets/header-logo.svg"
                        alt="Urbanouse Logo"
                        className="h-8 w-auto"
                    />
                </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-8 font-jakarta text-sm font-medium">
                <NavLink to="/" className={linkClass}>
                    Home
                </NavLink>
                <NavLink to="/about" className={linkClass}>
                    About Us
                </NavLink>

                <div className="flex items-center gap-1 cursor-pointer text-gray-500 hover:text-[#0B132B] transition-colors">
                    <NavLink to="/properties" className={linkClass}>
                        Properties
                    </NavLink>
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <NavLink to="/agents" className={linkClass}>
                    Agents
                </NavLink>
                <NavLink to="/projects" className={linkClass}>
                    Projects
                </NavLink>
                <NavLink to="/contacts" className={linkClass}>
                    Contact Us
                </NavLink>
            </nav>

            <div className="flex items-center gap-4 font-jakarta text-sm font-medium">
                <Link
                    to="/signup"
                    className="px-6 py-2.5 rounded-full border border-gray-800 text-[#0B132B] hover:bg-gray-200 transition-colors"
                >
                    Sign Up
                </Link>

                <Link
                    to="/signin"
                    className="px-6 py-2.5 rounded-full bg-[#0B132B] text-white hover:bg-gray-800 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        </header>
    );
}
