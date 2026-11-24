import { useEffect, useState } from 'react';
import AgentCard from '../../Components/AgentCard';
import { houses } from '../../houses';
import type { Agent } from '../../types';
import Faq from '../Home/FAQ/FAQ';
import Meet from '../Home/Meet/Meet';

export default function Agents() {
    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        document.title = 'Agents — Urbanouse';
        fetch('/api/agents')
            .then((res) => res.json())
            .then((json) => setAgents(json.data));
    }, []);

    const top = [...agents].sort((a, b) => b.properties_sold - a.properties_sold).slice(0, 4);

    return (
        <>
            <section className="w-full py-12 lg:py-24">
                <div className="wrapper flex flex-col items-center gap-10 lg:flex-row lg:gap-24">
                    <div className="w-full lg:w-1/2">
                        <span className="tag mb-8">Agents</span>
                        <h1 className="title mb-5">Meet Our Expert Agents</h1>
                        <p className="subtitle mb-10">
                            Your dedicated guides in the journey to your dream property.
                        </p>
                        <a href="#agents-list" className="btn">
                            View Our Agents
                        </a>
                    </div>
                    <img
                        src={houses[1].main}
                        alt=""
                        className="h-[320px] w-full rounded-3xl object-cover sm:h-[400px] lg:h-[550px] lg:w-1/2"
                    />
                </div>
            </section>

            <section className="section">
                <div className="wrapper flex flex-col items-center gap-10 lg:flex-row lg:gap-24">
                    <img
                        src={houses[3].main}
                        alt=""
                        className="order-2 h-[320px] w-full rounded-3xl object-cover sm:h-[400px] lg:order-1 lg:h-[500px] lg:w-1/2"
                    />
                    <div className="order-1 w-full lg:order-2 lg:w-1/2">
                        <span className="tag mb-8">Why Choose Us</span>
                        <h2 className="mb-6 text-3xl font-semibold leading-[1.15] sm:text-4xl lg:text-5xl">
                            Experience, Dedication, and Market Expertise You Can Trust.
                        </h2>
                        <p className="subtitle mb-5">
                            At Urbanouse, our agents are not just salespeople—they are trusted
                            advisors with deep market knowledge and a passion for helping you find
                            the perfect home or investment.
                        </p>
                        <p className="subtitle">
                            With years of experience in the real estate industry, they’re equipped
                            to guide you through every step of the buying, selling, or renting
                            process. Whether you’re a first-time homebuyer or a seasoned investor,
                            our agents offer personalized service tailored to your needs.
                        </p>
                    </div>
                </div>
            </section>

            <Meet id="agents-list" />

            <section className="section">
                <div className="wrapper">
                    <span className="tag mb-6">Top Agents</span>
                    <h2 className="title mb-12 max-w-4xl">Meet One of Our Top-Performing Agents</h2>
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
                        {top.map((agent) => (
                            <AgentCard key={agent.id} agent={agent} />
                        ))}
                    </div>
                </div>
            </section>

            <Faq />
        </>
    );
}
