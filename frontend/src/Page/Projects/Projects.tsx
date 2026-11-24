import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { houses } from '../../houses';
import type { City, Project } from '../../types';
import Faq from '../Home/FAQ/FAQ';

export default function Projects() {
    const [projects, setProjects] = useState<Project[] | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        document.title = 'Projects — Urbanouse';
        fetch('/api/projects')
            .then((res) => res.json())
            .then((json) => setProjects(json.data.filter((p: Project) => p.is_published)))
            .catch(() => setError(true));
        fetch('/api/cities')
            .then((res) => res.json())
            .then((json) => setCities(json.data));
    }, []);

    return (
        <>
            <section className="section">
                <div className="wrapper">
                    <span className="tag mb-6">Projects</span>
                    <h1 className="title mb-4">Our Residential Projects</h1>
                    <p className="subtitle mb-12">
                        Explore developments and collections curated by Urbanouse across our cities.
                    </p>

                    {error && (
                        <p className="error">Could not load projects. Is the backend running?</p>
                    )}
                    {!projects && !error && <p className="text-muted">Loading…</p>}
                    {projects?.length === 0 && <p className="text-muted">No projects yet.</p>}

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {projects?.map((project, index) => (
                            <article
                                key={project.id}
                                className="flex flex-col overflow-hidden rounded-3xl border border-line">
                                <img
                                    src={houses[index % houses.length].main}
                                    alt={project.title}
                                    loading="lazy"
                                    className="aspect-[16/10] w-full object-cover"
                                />
                                <div className="flex flex-1 flex-col gap-3 p-6">
                                    <h2 className="text-2xl font-semibold">{project.title}</h2>
                                    <p className="text-sm font-medium text-muted">
                                        {cities.find((c) => c.id === project.city_id)?.name}
                                    </p>
                                    <p className="leading-relaxed text-muted">
                                        {project.description}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <span className="text-sm font-medium">
                                            {project.units_available}+ units available
                                        </span>
                                        <Link
                                            to={`/properties/list?city_id=${project.city_id}`}
                                            className="pill">
                                            View homes
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <Faq />
        </>
    );
}
