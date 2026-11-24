import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { City, PropertyType } from '../types';

export interface SearchValues {
    listing_type: string;
    city_id: string;
    property_type_id: string;
    min_bedrooms: string;
    max_price: string;
}

interface Props {
    initial?: Partial<SearchValues>;
    onSearch?: (values: SearchValues) => void;
}

export default function SearchBar({ initial, onSearch }: Props) {
    const navigate = useNavigate();
    const [cities, setCities] = useState<City[]>([]);
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [values, setValues] = useState<SearchValues>({
        listing_type: '',
        city_id: '',
        property_type_id: '',
        min_bedrooms: '',
        max_price: '',
        ...initial,
    });

    useEffect(() => {
        fetch('/api/cities')
            .then((res) => res.json())
            .then((json) => setCities(json.data));
        fetch('/api/property_types')
            .then((res) => res.json())
            .then((json) => setTypes(json.data));
    }, []);

    const fields: { name: keyof SearchValues; label: string; options: string[][] }[] = [
        {
            name: 'listing_type',
            label: 'Looking for',
            options: [
                ['', 'Buy or rent'],
                ['sale', 'Buy'],
                ['rent', 'Rent'],
            ],
        },
        {
            name: 'city_id',
            label: 'Location',
            options: [['', 'All cities'], ...cities.map((c) => [String(c.id), c.name])],
        },
        {
            name: 'property_type_id',
            label: 'Property type',
            options: [['', 'All types'], ...types.map((t) => [String(t.id), t.name])],
        },
        {
            name: 'min_bedrooms',
            label: 'Bedrooms',
            options: [['', 'Any'], ...[1, 2, 3, 4, 5].map((n) => [String(n), `${n}+ bedrooms`])],
        },
        {
            name: 'max_price',
            label: 'Budget',
            options: [
                ['', 'Any budget'],
                ...[300000, 500000, 750000, 1000000, 2000000].map((n) => [
                    String(n),
                    `Up to $${n.toLocaleString('en-US')}`,
                ]),
            ],
        },
    ];

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (onSearch) {
            onSearch(values);
            return;
        }
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(values)) {
            if (value) params.set(key, value);
        }
        navigate(`/properties/list?${params.toString()}`);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:items-end lg:gap-8">
            {fields.map((field) => (
                <label
                    key={field.name}
                    className="flex min-w-0 flex-col text-sm text-muted lg:flex-1">
                    <span className="mb-1">{field.label}</span>
                    <select
                        className="select"
                        value={values[field.name]}
                        onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}>
                        {field.options.map(([value, text]) => (
                            <option key={value} value={value}>
                                {text}
                            </option>
                        ))}
                    </select>
                </label>
            ))}

            <button
                type="submit"
                aria-label="Search"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent hover:opacity-80">
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.3-4.3M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                    />
                </svg>
            </button>
        </form>
    );
}
