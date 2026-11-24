import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../AuthLayout';

export default function SignUp() {
    const navigate = useNavigate();
    const location = useLocation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');

    const from = (location.state as { from?: string } | null)?.from ?? '/';
    if (localStorage.getItem('token')) return <Navigate to={from} replace />;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim())
            return setError('Enter your first and last name');
        if (!email.includes('@')) return setError('Enter a valid email address');
        if (password.length < 6 || password.length > 72)
            return setError('Password must be 6 to 72 characters long');
        if (password !== confirm) return setError('Passwords do not match');

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
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
            title="Join Urbanouse"
            subtitle="Create an account to book tours, save favorites and track your inquiries."
            sideTitle="Find Your Perfect Home"
            sideText="Once your profile is set up, search by location, price and type.">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        aria-label="First name"
                        className="input"
                    />
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        aria-label="Last name"
                        className="input"
                    />
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    aria-label="Email"
                    className="input"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (6–72 characters)"
                    aria-label="Password"
                    className="input"
                />
                <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    aria-label="Confirm password"
                    className="input"
                />

                {error && (
                    <p role="alert" className="error">
                        {error}
                    </p>
                )}

                <button type="submit" className="btn">
                    Sign Up
                </button>
            </form>

            <p className="mt-8 text-center text-sm">
                Already have an account?{' '}
                <Link
                    to="/signin"
                    state={location.state}
                    className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                    Log In
                </Link>
            </p>
        </AuthLayout>
    );
}
