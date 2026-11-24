import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../AuthLayout';

export default function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const from = (location.state as { from?: string } | null)?.from ?? '/';

    if (localStorage.getItem('token')) return <Navigate to={from} replace />;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        if (!email || !password) return setError('Enter your email and password');

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        }).catch(() => null);
        const json = await res?.json();
        if (!json?.success) return setError(json?.error ?? 'Cannot reach the server');

        localStorage.setItem('token', json.token);
        localStorage.setItem('user', JSON.stringify(json.user));
        window.dispatchEvent(new Event('auth'));
        navigate(from, { replace: true });
    };

    return (
        <AuthLayout
            title="Welcome Back!"
            subtitle="Log in to manage your property searches and get personalized recommendations."
            sideTitle="Explore Properties"
            sideText="Use our search to find properties by location, price, and type.">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <label className="flex flex-col gap-2 text-sm font-medium">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="input"
                    />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="input"
                    />
                </label>

                {error && (
                    <p role="alert" className="error">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn">
                    Log In
                </button>
            </form>

            <p className="mt-8 text-center text-sm">
                Don’t have an account?{' '}
                <Link
                    to="/signup"
                    state={location.state}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    Sign Up
                </Link>
            </p>
        </AuthLayout>
    );
}
