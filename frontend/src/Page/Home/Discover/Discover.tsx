import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../../Components/PropertyCard';
import type { Property, PropertyType } from '../../../types';

interface Props {
    tag?: string;
    title?: string;
    featuredOnly?: boolean;
}

export default function Discover({ tag = 'Featured Properties', title = 'Discover Urbanouse Properties', featuredOnly = false }: Props) {
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [typeId, setTypeId] = useState(''); 
    const [properties, setProperties] = useState<Property[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/property_types')
            .then((res) => res.json())
            .then((json) => setTypes(json.data));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (typeId) params.set('property_type_id', typeId);
        if (featuredOnly) params.set('is_featured', 'true');
        fetch(`/api/properties?${params.toString()}`)
            .then((res) => res.json())
            .then((json) => setProperties(json.data))
            .catch(() => setError(true));
    }, [typeId, featuredOnly]);

    return (
        <section className="section">
            <div className="wrapper">
                <span className="tag mb-8">{tag}</span>
                <div className="mb-10 flex flex-col justify-between gap-6 lg:mb-12 lg:flex-row lg:gap-12">
                    <h2 className="title max-w-3xl">{title}</h2>
                    <p className="subtitle lg:max-w-md">
                        Explore an exclusive selection of premium properties, meticulously curated to provide you with the best in luxury living and prime real estate
                        investment options.
                    </p>
                </div>

                <div className="mb-10 flex flex-wrap justify-center gap-3">
                    <button type="button" onClick={() => setTypeId('')} className={`pill ${typeId === '' ? 'pill-active' : ''}`}>All Properties</button>
                    {types.map((type) => (
                        <button key={type.id} type="button" onClick={() => setTypeId(String(type.id))} className={`pill ${typeId === String(type.id) ? 'pill-active' : ''}`}>
                            {type.name}
                        </button>
                    ))}
                </div>

                {error && <p className="text-center text-muted">Could not load properties. Is the backend running?</p>}

                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.slice(0, 6).map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link to="/properties/list" className="btn">View all properties</Link>
                </div>
            </div>
        </section>
    );
}
