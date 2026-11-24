import { useEffect, useState } from 'react';

export default function Statistics() {
    const [stats, setStats] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        Promise.all([fetch('/api/properties'), fetch('/api/agents'), fetch('/api/cities')])
            .then((responses) => Promise.all(responses.map((res) => res.json())))
            .then(([properties, agents, cities]) => {
                const all = properties.data;
                setStats([
                    { label: 'Homes for rent', value: all.filter((p: { listing_type: string }) => p.listing_type === 'rent').length },
                    { label: 'Homes to buy', value: all.filter((p: { listing_type: string }) => p.listing_type === 'sale').length },
                    { label: 'Agents', value: agents.data.length },
                    { label: 'Cities covered', value: cities.data.length },
                    { label: 'Total properties', value: all.length },
                ]);
            });
    }, []);

    if (stats.length === 0) return null;

    return (
        <section className="w-full bg-[#0A0F1C] py-16 lg:py-24">
            <dl className="wrapper grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse gap-2">
                        <dt className="text-sm font-medium text-gray-400 lg:text-base">{stat.label}</dt>
                        <dd className="text-4xl font-medium text-white lg:text-5xl">{stat.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
