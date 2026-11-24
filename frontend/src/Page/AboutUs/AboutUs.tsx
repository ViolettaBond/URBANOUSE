import { useEffect } from 'react';
import designInterior from '../../assets/design-interior.jpg';
import familyHouse from '../../assets/family-house.jpg';
import luxuryApartment from '../../assets/luxury-apartament.jpg';
import modernVilla from '../../assets/modern-villa.jpg';
import Faq from '../Home/FAQ/FAQ';
import Meet from '../Home/Meet/Meet';
import Testimonial from '../Home/Testimonial/Testimonial';

const values = [
    {
        title: 'Integrity',
        text: 'We are always honest and transparent in all dealings, ensuring that clients receive clear and accurate information to make informed decisions.',
    },
    {
        title: 'Excellence',
        text: 'We strive to exceed expectations by delivering outstanding results, paying close attention to detail and committing fully to the quality of our services.',
    },
    {
        title: 'Customer-Centricity',
        text: 'Our clients are our top priority; we listen carefully to their needs and provide personalized solutions tailored to each individual.',
    },
    {
        title: 'Innovation',
        text: 'We continuously adopt the latest technologies and ideas to offer better, more efficient, and relevant services in the ever-evolving real estate market.',
    },
    {
        title: 'Collaboration',
        text: 'We believe in the power of teamwork, both internally and with our clients, ensuring that every project benefits from collective expertise and shared goals.',
    },
    {
        title: 'Sustainability',
        text: 'We are dedicated to supporting eco-friendly practices and sustainable development, ensuring a positive impact on both the community and the environment.',
    },
];

export default function AboutUs() {
    useEffect(() => {
        document.title = 'About Us — Urbanouse';
    }, []);

    return (
        <>
            <section className="w-full py-12 lg:py-24">
                <div className="wrapper grid gap-10 lg:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col justify-center lg:col-span-5 lg:pr-12">
                        <span className="tag mb-8">About Urbanouse</span>
                        <h1 className="title mb-6">Your Dream Home, Our Expertise.</h1>
                        <p className="subtitle">
                            Connecting you with premium properties and unparalleled real estate
                            services.
                        </p>
                    </div>
                    <img
                        src={familyHouse}
                        alt="Modern family house"
                        className="h-[300px] w-full rounded-3xl object-cover sm:h-[400px] lg:col-span-7 lg:h-[600px]"
                    />
                </div>
            </section>

            <section className="section">
                <div className="wrapper flex flex-col gap-12 lg:gap-24">
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                        <div className="flex flex-col justify-center lg:col-span-5 lg:pr-12">
                            <span className="tag mb-8">Our Vision</span>
                            <h2 className="mb-6 text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
                                Tailored Real Estate Solutions for Every Client
                            </h2>
                            <p className="subtitle">
                                At Urbanouse, our mission is to provide clients with seamless real
                                estate solutions tailored to their unique needs, ensuring a
                                rewarding and fulfilling experience at every step.
                            </p>
                        </div>
                        <img
                            src={luxuryApartment}
                            alt="Modern apartment"
                            className="h-[300px] w-full rounded-3xl object-cover sm:h-[400px] lg:col-span-7 lg:h-[560px]"
                        />
                    </div>

                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                        <div className="flex flex-col justify-center lg:order-2 lg:col-span-5 lg:pl-12">
                            <span className="tag mb-8">Our Mission</span>
                            <h2 className="mb-6 text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">
                                Leading with Excellence, Integrity, and Innovation
                            </h2>
                            <p className="subtitle">
                                Our vision is to become a trusted leader in the real estate industry
                                by delivering excellence, integrity, and innovation in every
                                transaction.
                            </p>
                        </div>
                        <img
                            src={designInterior}
                            alt="Designed living room"
                            className="h-[300px] w-full rounded-3xl object-cover sm:h-[400px] lg:order-1 lg:col-span-7 lg:h-[560px]"
                        />
                    </div>

                    <img
                        src={modernVilla}
                        alt="Modern villa"
                        className="h-[260px] w-full rounded-3xl object-cover sm:h-[360px]"
                    />
                </div>
            </section>

            <section className="section">
                <div className="wrapper">
                    <span className="tag mb-6">Our Core Value</span>
                    <h2 className="title mb-12">What We Stand For You</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {values.map((value) => (
                            <article
                                key={value.title}
                                className="rounded-3xl border border-line p-6 lg:p-8">
                                <h3 className="mb-3 text-xl font-semibold">{value.title}</h3>
                                <p className="leading-relaxed text-muted">{value.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <Meet filters={false} step={4} />
            <Testimonial />
            <Faq />
        </>
    );
}
