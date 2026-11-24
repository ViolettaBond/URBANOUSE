import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PropertyCard from '../../Components/PropertyCard';
import PropertyMap from '../../Components/PropertyMap';
import SearchBar, { type SearchValues } from '../../Components/SearchBar';
import type { City, Property, PropertyType } from '../../types';
import Faq from '../Home/FAQ/FAQ';
import PopularProperties from './PopularProperties';

type View = 'split' | 'grid' | 'map';

export default function PropertyList() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[] | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [view, setView] = useState<View>('split');
    const [page, setPage] = useState(1);
    const [error, setError] = useState(false);

    const query = params.toString();

    useEffect(() => {
        fetch('/api/cities')
            .then((res) => res.json())
            .then((json) => setCities(json.data));
        fetch('/api/property_types')
            .then((res) => res.json())
            .then((json) => setTypes(json.data));
    }, []);

    useEffect(() => {
        setError(false);
        setPage(1);
        fetch(`/api/properties?${query}`)
            .then((res) => res.json())
            .then((json) => setProperties(json.data))
            .catch(() => setError(true));
    }, [query]);

    const city = cities.find((c) => String(c.id) === params.get('city_id'));
    let title = 'All properties';
    if (city) title = `Properties in ${city.name}`;
    else if (params.get('is_popular')) title = 'Most popular properties';
    else if (params.get('listing_type') === 'sale') title = 'Properties for sale';
    else if (params.get('listing_type') === 'rent') title = 'Properties for rent';

    useEffect(() => {
        document.title = `${title} — Urbanouse`;
    }, [title]);

    const setFilter = (name: string, value: string) => {
        const next = new URLSearchParams(params);
        if (value) next.set(name, value);
        else next.delete(name);
        setParams(next);
    };

    const handleSearch = (values: SearchValues) => {
        const next = new URLSearchParams();
        for (const [name, value] of Object.entries(values)) {
            if (value) next.set(name, value);
        }
        setParams(next);
    };

    const items = properties ?? [];
    const pageSize = view === 'split' ? 6 : 9;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const shown = items.slice((page - 1) * pageSize, page * pageSize);
    const activeType = params.get('property_type_id') ?? '';

    const cards = (
        <>
            <div
                className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 ${view === 'grid' ? 'lg:grid-cols-3' : ''}`}>
                {shown.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            aria-current={n === page}
                            className={`h-9 w-9 rounded-full border text-sm ${n === page ? 'border-accent bg-accent text-on-accent' : 'border-line hover:bg-panel'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <>
            <section className="w-full pb-16 pt-8 lg:pb-24 lg:pt-12">
                <div className="wrapper">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="w-full lg:max-w-4xl">
                            <SearchBar
                                key={query}
                                onSearch={handleSearch}
                                initial={{
                                    listing_type: params.get('listing_type') ?? '',
                                    city_id: params.get('city_id') ?? '',
                                    property_type_id: activeType,
                                    min_bedrooms: params.get('min_bedrooms') ?? '',
                                    max_price: params.get('max_price') ?? '',
                                }}
                            />
                        </div>

                        <div className="flex gap-2">
                            {(['split', 'grid', 'map'] as View[]).map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        setView(name);
                                        setPage(1);
                                    }}
                                    aria-pressed={view === name}
                                    className={`pill ${view === name ? 'pill-active' : ''}`}>
                                    {name === 'split'
                                        ? 'Cards + map'
                                        : name === 'grid'
                                          ? 'Cards'
                                          : 'Map'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h1 className="mb-3 mt-12 text-4xl font-semibold tracking-tight sm:text-5xl lg:mt-16 lg:text-6xl">
                        {title}
                    </h1>
                    <p className="mb-10 text-muted sm:text-lg">
                        {properties ? `${items.length} found` : 'Loading…'}
                    </p>

                    <div className="mb-10 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setFilter('property_type_id', '')}
                            className={`pill ${activeType === '' ? 'pill-active' : ''}`}>
                            All Properties
                        </button>
                        {types.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setFilter('property_type_id', String(type.id))}
                                className={`pill ${activeType === String(type.id) ? 'pill-active' : ''}`}>
                                {type.name}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <p className="error">Could not load properties. Is the backend running?</p>
                    )}
                    {properties && items.length === 0 && (
                        <p className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
                            No properties match your search.{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/properties/list')}
                                className="underline">
                                Reset filters
                            </button>
                        </p>
                    )}

                    {items.length > 0 && view === 'split' && (
                        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="order-2 lg:order-1">{cards}</div>
                            <div className="order-1 lg:order-2">
                                <PropertyMap
                                    properties={items}
                                    onSelect={(id) => navigate(`/properties/${id}`)}
                                    className="z-0 h-[320px] w-full overflow-hidden rounded-3xl lg:sticky lg:top-28 lg:h-[640px]"
                                />
                            </div>
                        </div>
                    )}
                    {items.length > 0 && view === 'grid' && cards}
                    {items.length > 0 && view === 'map' && (
                        <PropertyMap
                            properties={items}
                            onSelect={(id) => navigate(`/properties/${id}`)}
                            className="z-0 h-[70vh] min-h-[420px] w-full overflow-hidden rounded-3xl"
                        />
                    )}
                </div>
            </section>

            <PopularProperties />
            <Faq />
        </>
    );
}
