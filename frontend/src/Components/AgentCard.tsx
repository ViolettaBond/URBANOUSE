import { Link } from 'react-router-dom';
import type { Agent } from '../types';

export default function AgentCard({ agent }: { agent: Agent }) {
    const name = `${agent.first_name} ${agent.last_name}`;

    return (
        <article className="flex min-w-0 flex-col">
            <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-panel">
                {agent.photo_url && (
                    <img
                        src={agent.photo_url}
                        alt={name}
                        loading="lazy"
                        onError={(event) => (event.currentTarget.style.display = 'none')}
                        className="h-full w-full object-cover"
                    />
                )}
            </div>

            <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="truncate text-lg font-semibold">{name}</h3>
                <p className="text-sm font-medium">
                    <span className="text-amber-500">★</span> {Number(agent.rating).toFixed(1)}
                </p>
            </div>
            <p className="mb-3 text-sm text-muted">{agent.title}</p>
            <p className="mb-4 text-sm text-muted">
                {agent.city} · {agent.properties_sold} properties sold
            </p>

            <div className="mt-auto flex gap-2">
                {agent.email && (
                    <a
                        href={`mailto:${agent.email}`}
                        className="flex-1 rounded-full border border-line py-2 text-center text-sm font-medium hover:bg-panel">
                        Contact Agent
                    </a>
                )}
                <Link
                    to={`/properties/list?agent_id=${agent.id}`}
                    className="flex-1 rounded-full bg-accent py-2 text-center text-sm font-medium text-on-accent hover:opacity-80">
                    Listings
                </Link>
            </div>
        </article>
    );
}
