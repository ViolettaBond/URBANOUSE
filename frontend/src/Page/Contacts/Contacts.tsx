import { useEffect, useState, type FormEvent } from 'react';

export default function Contacts() {
    // если пользователь вошёл — подставляем его данные
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    const [name, setName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    useEffect(() => {
        document.title = 'Contact Us — Urbanouse';
    }, []);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        if (!email.includes('@')) return setError('Enter a valid email address');
        if (!message.trim()) return setError('Write a message so we know how to help');

        const res = await fetch('/api/contact_messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone: phone || undefined, message }),
        }).catch(() => null);
        const json = await res?.json();
        if (!json?.success) return setError(json?.error ?? 'Cannot reach the server');
        setSent(true);
    };

    return (
        <section className="section">
            <div className="wrapper grid gap-12 lg:grid-cols-2 lg:gap-24">
                <div>
                    <span className="tag mb-6">Contact Us</span>
                    <h1 className="title mb-4">Let’s talk about your next home</h1>
                    <p className="subtitle mb-10">
                        Send us a message and an Urbanouse advisor will reply by email.
                    </p>
                    <address className="flex flex-col gap-3 not-italic">
                        <p>2223 Calle Deal Cala Salamanca, Madrid, 28028</p>
                        <a href="tel:+34123456789" className="w-fit hover:underline">
                            (+34) 123-456-789
                        </a>
                        <a href="mailto:marketing@urbanouse.com" className="w-fit hover:underline">
                            marketing@urbanouse.com
                        </a>
                    </address>
                </div>

                <div className="rounded-3xl border border-line p-6 sm:p-10">
                    {sent ? (
                        <p role="status" className="text-lg">
                            Message sent. Thank you, we’ll reply to {email} soon.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Name"
                                className="input"
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="input"
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone (optional)"
                                    className="input"
                                />
                            </div>
                            <textarea
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="How can we help?"
                                className="input resize-none"
                            />
                            {error && (
                                <p role="alert" className="error">
                                    {error}
                                </p>
                            )}
                            <button type="submit" className="btn">
                                Send message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
