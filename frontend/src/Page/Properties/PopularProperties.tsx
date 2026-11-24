import { useEffect, useRef, useState } from 'react';
import PropertyCard from '../../Components/PropertyCard';
import type { Property } from '../../types';

export default function PopularProperties() {
    const [items, setItems] = useState<Property[]>([]);
    const row = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/properties?is_popular=true')
            .then((res) => res.json())
            .then((json) => setItems(json.data));
    }, []);

    const scroll = (direction: number) => {
        if (row.current)
            row.current.scrollBy({
                left: direction * row.current.clientWidth * 0.8,
                behavior: 'smooth',
            });
    };

    return (
        <section className="section overflow-hidden">
            <div className="wrapper">
                <div className="mb-12 flex items-end justify-between gap-6">
                    <div>
                        <span className="tag mb-6">Popular Properties</span>
                        <h2 className="title mb-4">Our Most Popular Properties</h2>
                        <p className="subtitle">
                            Browse the homes and investments that have captivated buyers and
                            investors alike, offering outstanding deals and high demand.
                        </p>
                    </div>
                    <div className="hidden gap-3 sm:flex">
                        <button
                            type="button"
                            aria-label="Scroll left"
                            onClick={() => scroll(-1)}
                            className="h-10 w-10 rounded-full border border-line hover:bg-panel">
                            ‹
                        </button>
                        <button
                            type="button"
                            aria-label="Scroll right"
                            onClick={() => scroll(1)}
                            className="h-10 w-10 rounded-full border border-line hover:bg-panel">
                            ›
                        </button>
                    </div>
                </div>

                <div ref={row} className="scrollbar-hide flex gap-6 overflow-x-auto pb-4">
                    {items.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            className="w-[280px] shrink-0 sm:w-[340px]"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
