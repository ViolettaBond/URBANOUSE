import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Inquiry } from '../../types';

const typeNames: Record<string, string> = {
    request_showing: 'Showing request',
    tour_in_person: 'In-person tour',
    tour_video: 'Video tour',
    ask_question: 'Question',
    message_agent: 'Message to agent',
    call_request: 'Call request',
    offer: 'Offer',
};

export default function Account() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.title = 'My inquiries — Urbanouse';
        fetch('/api/inquiries/my', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((res) => res.json())
            .then((json) => setInquiries(json.data))
            .catch(() => setError(true));
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth'));
        navigate('/');
    };

    return (
        <section className="section">
            <div className="wrapper max-w-4xl">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="mb-2 text-4xl font-semibold tracking-tight sm:text-5xl">My inquiries</h1>
                        {user && <p className="text-muted">{user.first_name} {user.last_name} · {user.email}</p>}
                    </div>
                    <button type="button" onClick={logout} className="pill">Sign out</button>
                </div>

                {error && <p className="error">Could not load inquiries. Is the backend running?</p>}
                {inquiries?.length === 0 && (
                    <p className="text-muted">No inquiries yet. Book a tour from any <Link to="/properties/list" className="underline">property page</Link>.</p>
                )}

                <ul className="flex flex-col gap-4">
                    {inquiries?.map((item) => (
                        <li key={item.id} className="rounded-3xl border border-line p-5 sm:p-6">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                <Link to={`/properties/${item.property_id}`} className="text-lg font-semibold hover:underline">{item.property_title ?? 'Property'}</Link>
                                <span className="rounded-full border border-line px-3 py-1 text-xs font-medium">{item.status}</span>
                            </div>
                            <p className="text-sm text-muted">
                                {typeNames[item.type] ?? item.type} · {new Date(item.created_at).toLocaleDateString('en-GB')}
                                {item.offer_amount && ` · Offer $${Number(item.offer_amount).toLocaleString('en-US')}`}
                            </p>
                            {item.message && <p className="mt-2">{item.message}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
