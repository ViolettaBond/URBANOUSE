import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { houses } from '../../../houses';
import type { Project } from '../../../types';

export default function About() {
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        fetch('/api/projects')
            .then((res) => res.json())
            .then((json) => setProjects(json.data.filter((p: Project) => p.is_published).slice(0, 4)));
    }, []);

    return (
        <section className="section">
            <div className="wrapper">
                <div className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:gap-12">
                    <div className="lg:w-1/2">
                        <span className="tag mb-8">About Urbanouse</span>
                        <h2 className="title">Your Dream Home,<br />Our Expertise.</h2>
                    </div>
                    <p className="subtitle lg:w-[45%] lg:pt-20">
                        At Urbanouse, we are committed to helping individuals and families find their perfect homes and smart investment properties. Our approach
                        blends personalized service, expert insights, and a dedication to excellence, ensuring your real estate journey is seamless, rewarding, and
                        tailored to your unique needs.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {projects.map((project, index) => (
                        <Link
                            key={project.id}
                            to={`/properties/list?city_id=${project.city_id}`}
                            className={`group relative h-[260px] overflow-hidden rounded-3xl lg:h-[350px] ${index === 0 ? 'sm:col-span-2' : ''}`}
                        >
                            <img src={houses[index].main} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 text-white">
                                <h3 className="mb-1 text-xl font-semibold">{project.title}</h3>
                                <span className="text-sm">{project.units_available}+ units available</span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link to="/projects" className="btn-outline">More projects →</Link>
                </div>
            </div>
        </section>
    );
}
