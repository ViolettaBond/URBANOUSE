import { useEffect, useState } from 'react';
import AgentCard from '../../../Components/AgentCard';
import type { Agent, City, Property, PropertyType } from '../../../types';

interface Props {
    id?: string;
    filters?: boolean;
    step?: number;
}

export default function Meet({ id, filters = true, step = 8 }: Props) {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [cityId, setCityId] = useState('');
    const [typeId, setTypeId] = useState('');
    const [visible, setVisible] = useState(step);
    const [error, setError] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/agents'),
            fetch('/api/properties'),
            fetch('/api/cities'),
            fetch('/api/property_types'),
        ])
            .then((responses) => Promise.all(responses.map((res) => res.json())))
            .then(([a, p, c, t]) => {
                setAgents(a.data);
                setProperties(p.data);
                setCities(c.data);
                setTypes(t.data);
            })
            .catch(() => setError(true));
    }, []);

    const agentsWithType = properties
        .filter((p) => String(p.property_type_id) === typeId)
        .map((p) => String(p.agent_id));

    const filtered = agents.filter((agent) => {
        const cityOk = !cityId || String(agent.city_id) === cityId;
        const typeOk = !typeId || agentsWithType.includes(String(agent.id));
        return cityOk && typeOk;
    });

    return (
        <section id={id} className="section">
            <div className="wrapper">
                <span className="tag mb-6">Meet Our Agents</span>
                <h2 className="title mb-4">Our Agents of Experts</h2>
                <p className="subtitle mb-12">
                    Dedicated professionals passionate about making your real estate dreams come
                    true.
                </p>

                {filters && (
                    <div className="mb-12 flex flex-col gap-6 sm:flex-row">
                        <label className="flex flex-col text-sm text-muted sm:w-64">
                            <span className="mb-1">Location</span>
                            <select
                                className="select"
                                value={cityId}
                                onChange={(e) => {
                                    setCityId(e.target.value);
                                    setVisible(step);
                                }}>
                                <option value="">All cities</option>
                                {cities.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col text-sm text-muted sm:w-64">
                            <span className="mb-1">Property type</span>
                            <select
                                className="select"
                                value={typeId}
                                onChange={(e) => {
                                    setTypeId(e.target.value);
                                    setVisible(step);
                                }}>
                                <option value="">All types</option>
                                {types.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {error && (
                    <p className="text-muted">Could not load agents. Is the backend running?</p>
                )}
                {!error && filtered.length === 0 && <p className="text-muted">No agents found.</p>}

                <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                    {filtered.slice(0, visible).map((agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>

                {visible < filtered.length && (
                    <div className="mt-16 flex justify-center">
                        <button
                            type="button"
                            onClick={() => setVisible(visible + step)}
                            className="btn">
                            View More
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
