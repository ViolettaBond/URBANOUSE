import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/header-logo.svg';
import type { City, User } from '../../types';

const propertyLinks = [
    { to: '/properties', label: 'All properties' },
    { to: '/properties/list?listing_type=sale', label: 'Buy' },
    { to: '/properties/list?listing_type=rent', label: 'Rent' },
    { to: '/properties/list?is_popular=true', label: 'Most popular' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-base ${isActive ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'}`;

function readUser(): User | null {
    return JSON.parse(localStorage.getItem('user') ?? 'null');
}

export default function Header() {
    const location = useLocation();
    const [menu, setMenu] = useState<'' | 'properties' | 'user' | 'mobile'>(''); // какое меню сейчас открыто
    const [cities, setCities] = useState<City[]>([]);
    const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
    const [user, setUser] = useState(readUser());

    useEffect(() => {
        fetch('/api/cities')
            .then((res) => res.json())
            .then((json) => setCities(json.data.slice(0, 8)));
    }, []);

    useEffect(() => {
        const refresh = async () => {
            setUser(readUser());
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.removeItem('favorites');
                return;
            }
            const res = await fetch('/api/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                return;
            }
            const json = await res.json();
            localStorage.setItem(
                'favorites',
                JSON.stringify(json.data.map((p: { id: string }) => String(p.id))),
            );
        };
        refresh();
        window.addEventListener('auth', refresh);
        return () => window.removeEventListener('auth', refresh);
    }, []);

    useEffect(() => {
        setMenu('');
    }, [location.pathname, location.search]);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark', !dark);
        localStorage.setItem('urbanouse_theme', dark ? 'light' : 'dark');
        setDark(!dark);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth'));
    };

    const toggle = (name: 'properties' | 'user' | 'mobile') => setMenu(menu === name ? '' : name);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-page/90 backdrop-blur-md">
            <div className="wrapper flex h-20 items-center justify-between gap-4 xl:h-24">
                <Link to="/">
                    <img src={logo} alt="Urbanouse" className="h-7 w-auto dark:invert" />
                </Link>

                <nav className="hidden items-center gap-8 xl:flex">
                    <NavLink to="/" end className={linkClass}>
                        Home
                    </NavLink>
                    <NavLink to="/about" className={linkClass}>
                        About Us
                    </NavLink>

                    <div
                        className="relative"
                        onMouseEnter={() => setMenu('properties')}
                        onMouseLeave={() => setMenu('')}>
                        <div className="flex items-center gap-2">
                            <NavLink to="/properties" className={linkClass}>
                                Properties
                            </NavLink>
                            <button
                                type="button"
                                aria-label="Properties menu"
                                aria-expanded={menu === 'properties'}
                                onClick={() => toggle('properties')}
                                className="p-1 text-muted hover:text-ink">
                                ▾
                            </button>
                        </div>

                        {menu === 'properties' && (
                            <div className="absolute left-1/2 top-full w-[30rem] -translate-x-1/2 pt-3">
                                <div className="grid grid-cols-2 gap-6 rounded-3xl border border-line bg-page p-6 shadow-2xl">
                                    <ul className="flex flex-col gap-1">
                                        <li className="mb-1 text-sm text-muted">Browse</li>
                                        {propertyLinks.map((link) => (
                                            <li key={link.to}>
                                                <Link
                                                    to={link.to}
                                                    className="block rounded-xl px-3 py-2 hover:bg-panel">
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <ul className="flex flex-col gap-1">
                                        <li className="mb-1 text-sm text-muted">By city</li>
                                        {cities.map((city) => (
                                            <li key={city.id}>
                                                <Link
                                                    to={`/properties/list?city_id=${city.id}`}
                                                    className="block rounded-xl px-3 py-1.5 hover:bg-panel">
                                                    {city.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
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

                <div className="flex items-center gap-3 text-sm font-medium">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle dark theme"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-panel">
                        {dark ? '☀' : '☾'}
                    </button>

                    {!user && (
                        <div className="hidden items-center gap-3 sm:flex">
                            <Link
                                to="/signup"
                                className="rounded-full border border-ink px-6 py-2.5 hover:bg-panel">
                                Sign Up
                            </Link>
                            <Link
                                to="/signin"
                                className="rounded-full bg-accent px-6 py-2.5 text-on-accent hover:opacity-80">
                                Sign In
                            </Link>
                        </div>
                    )}

                    {user && (
                        <div className="relative">
                            <button
                                type="button"
                                aria-label="Account menu"
                                onClick={() => toggle('user')}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-80">
                                {user.first_name[0]}
                                {user.last_name[0]}
                            </button>
                            {menu === 'user' && (
                                <div className="absolute right-0 top-full mt-3 w-64 rounded-3xl border border-line bg-page p-3 shadow-2xl">
                                    <p className="truncate px-3 font-semibold">
                                        {user.first_name} {user.last_name}
                                    </p>
                                    <p className="mb-2 truncate border-b border-line px-3 pb-3 text-sm text-muted">
                                        {user.email}
                                    </p>
                                    <Link
                                        to="/favorites"
                                        className="block rounded-xl px-3 py-2 hover:bg-panel">
                                        Favorites
                                    </Link>
                                    <Link
                                        to="/account"
                                        className="block rounded-xl px-3 py-2 hover:bg-panel">
                                        My inquiries
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="block rounded-xl px-3 py-2 hover:bg-panel">
                                            Admin panel
                                        </Link>
                                    )}
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="block w-full rounded-xl px-3 py-2 text-left hover:bg-panel">
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        type="button"
                        aria-label="Menu"
                        onClick={() => toggle('mobile')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-line xl:hidden">
                        {menu === 'mobile' ? '✕' : '☰'}
                    </button>
                </div>
            </div>

            {menu === 'mobile' && (
                <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-line bg-page xl:hidden">
                    <div className="wrapper flex flex-col gap-1 py-4 text-lg">
                        <Link to="/" className="rounded-xl px-3 py-3 hover:bg-panel">
                            Home
                        </Link>
                        <Link to="/about" className="rounded-xl px-3 py-3 hover:bg-panel">
                            About Us
                        </Link>
                        {propertyLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="rounded-xl px-3 py-3 hover:bg-panel">
                                {link.to === '/properties'
                                    ? 'Properties'
                                    : `Properties · ${link.label}`}
                            </Link>
                        ))}
                        <Link to="/agents" className="rounded-xl px-3 py-3 hover:bg-panel">
                            Agents
                        </Link>
                        <Link to="/projects" className="rounded-xl px-3 py-3 hover:bg-panel">
                            Projects
                        </Link>
                        <Link to="/contacts" className="rounded-xl px-3 py-3 hover:bg-panel">
                            Contact Us
                        </Link>
                        {!user && (
                            <div className="mt-3 flex gap-3 border-t border-line pt-4 sm:hidden">
                                <Link to="/signup" className="btn-outline flex-1">
                                    Sign Up
                                </Link>
                                <Link to="/signin" className="btn flex-1">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}
