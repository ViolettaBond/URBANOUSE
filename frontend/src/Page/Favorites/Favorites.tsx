import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../Components/PropertyCard';
import type { Property } from '../../types';

export default function Favorites() {
    const [items, setItems] = useState<Property[] | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.title = 'Favorites — Urbanouse';
        fetch('/api/favorites', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((res) => res.json())
            .then((json) => setItems(json.data))
            .catch(() => setError(true));
    }, []);

    return (
        <section className="section">
            <div className="wrapper">
                <h1 className="mb-10 text-4xl font-semibold tracking-tight sm:text-5xl">Favorites</h1>

                {error && <p className="error">Could not load favorites. Is the backend running?</p>}
                {items?.length === 0 && (
                    <p className="text-muted">
                        Nothing saved yet. Tap the heart on any listing. <Link to="/properties/list" className="underline">Browse properties</Link>
                    </p>
                )}

                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {items?.map((property) => (
                        <PropertyCard key={property.id} property={property} onFavoriteChange={(active) => !active && setItems(items.filter((p) => p.id !== property.id))} />
                    ))}
                </div>
            </div>
        </section>
    );
}
