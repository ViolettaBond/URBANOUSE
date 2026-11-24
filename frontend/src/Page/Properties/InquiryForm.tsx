import { useState, type FormEvent } from 'react';
import Modal from '../../Components/Modal';

interface Props {
    type: string;
    propertyId: string | number;
    propertyTitle: string;
    onClose: () => void;
}

const titles: Record<string, string> = {
    tour_in_person: 'Book an in-person tour',
    tour_video: 'Book a video tour',
    offer: 'Start an offer',
    message_agent: 'Message the agent',
    call_request: 'Request a call',
};

export default function InquiryForm({ type, propertyId, propertyTitle, onClose }: Props) {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    const [name, setName] = useState(user ? `${user.first_name} ${user.last_name}` : '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [offer, setOffer] = useState('');
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        if (!email.includes('@')) return setError('Enter a valid email so the agent can reply');
        if (type === 'offer' && Number(offer) <= 0) return setError('Enter an offer amount');
        if (type === 'message_agent' && !message.trim()) return setError('Write a short message');

        const token = localStorage.getItem('token');
        const res = await fetch('/api/inquiries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                property_id: propertyId,
                type,
                name,
                email,
                phone: phone || undefined,
                message: message || undefined,
                offer_amount: type === 'offer' ? Number(offer) : undefined,
            }),
        }).catch(() => null);
        const json = await res?.json();
        if (!json?.success) return setError(json?.error ?? 'Cannot reach the server');
        setSent(true);
    };

    return (
        <Modal title={titles[type] ?? 'Contact the agent'} onClose={onClose}>
            {sent ? (
                <div className="flex flex-col items-start gap-4">
                    <p className="text-lg font-semibold">Request sent</p>
                    <p className="text-muted">
                        The agent will get back to you about “{propertyTitle}” soon.
                    </p>
                    <button type="button" onClick={onClose} className="btn">
                        Done
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                    <p className="text-sm text-muted">{propertyTitle}</p>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
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
                    {type === 'offer' && (
                        <input
                            type="number"
                            min="1"
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                            placeholder="Your offer, USD"
                            className="input"
                        />
                    )}
                    <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message"
                        className="input resize-none"
                    />

                    {error && (
                        <p role="alert" className="error">
                            {error}
                        </p>
                    )}
                    <button type="submit" className="btn">
                        Send request
                    </button>
                </form>
            )}
        </Modal>
    );
}
