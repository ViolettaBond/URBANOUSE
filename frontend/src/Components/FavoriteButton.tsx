import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function readIds(): string[] {
    return JSON.parse(localStorage.getItem('favorites') ?? '[]');
}

interface Props {
    propertyId: string | number;
    className?: string;
    withText?: boolean;
    onChange?: (active: boolean) => void;
}

export default function FavoriteButton({
    propertyId,
    className = '',
    withText = false,
    onChange,
}: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState(readIds().includes(String(propertyId)));

    const handleClick = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/signin', { state: { from: location.pathname + location.search } });
            return;
        }

        const res = active
            ? await fetch(`/api/favorites/${propertyId}`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${token}` },
              })
            : await fetch('/api/favorites', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ property_id: propertyId }),
              });
        const json = await res.json();
        if (!json.success) return;

        const ids = readIds().filter((id) => id !== String(propertyId));
        if (!active) ids.push(String(propertyId));
        localStorage.setItem('favorites', JSON.stringify(ids));
        setActive(!active);
        onChange?.(!active);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
            className={`flex items-center justify-center gap-2 rounded-full bg-page/90 hover:scale-105 ${withText ? 'border border-line px-4 py-2 text-sm font-medium' : 'h-10 w-10'} ${className}`}>
            <svg
                className={`h-5 w-5 ${active ? 'fill-red-500 text-red-500' : 'fill-none'}`}
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
                aria-hidden>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 5 6.6 5c1.9 0 3.5 1 4.4 2.5h2C13.9 6 15.5 5 17.4 5c3.2 0 5.1 3.2 3.9 6.3-1.8 4.6-9.3 9.2-9.3 9.2z"
                />
            </svg>
            {withText && <span>{active ? 'Saved' : 'Save'}</span>}
        </button>
    );
}
