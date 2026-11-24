import { useState } from 'react';

const reviews = [
    {
        quote: 'Urbanouse made buying our first home an absolute breeze! Their team was incredibly attentive and guided us through every step. We couldn’t be happier with our new home.',
        author: 'Sarah & Michael Stone',
        role: 'Homeowners',
    },
    {
        quote: 'I sold my apartment in three weeks. The agent handled the viewings, the paperwork and the negotiation, and kept me informed the whole way.',
        author: 'Daniel Moore',
        role: 'Seller',
    },
    {
        quote: 'Renting in a new city felt overwhelming until we found Urbanouse. Clear listings, honest advice and a smooth move-in.',
        author: 'Elena & Marco Rossi',
        role: 'Tenants',
    },
];

export default function Testimonial() {
    const [index, setIndex] = useState(0);
    const review = reviews[index];
    const go = (step: number) => setIndex((index + step + reviews.length) % reviews.length);

    return (
        <section className="section">
            <div className="wrapper">
                <span className="tag mb-6">Testimonial</span>
                <h2 className="title mb-4">What People Are Saying</h2>
                <p className="subtitle mb-16">
                    Real feedback from clients who’ve experienced the Urbanouse difference.
                </p>

                <figure className="mx-auto mb-12 max-w-4xl text-center">
                    <blockquote className="mb-10 text-xl leading-snug md:text-3xl md:leading-[1.4]">
                        “{review.quote}”
                    </blockquote>
                    <figcaption>
                        <span className="block font-semibold">{review.author}</span>
                        <span className="text-sm text-muted">{review.role}</span>
                    </figcaption>
                </figure>

                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        aria-label="Previous testimonial"
                        onClick={() => go(-1)}
                        className="h-10 w-10 rounded-full border border-line hover:bg-panel">
                        ‹
                    </button>
                    <span className="text-sm text-muted">
                        {index + 1} / {reviews.length}
                    </span>
                    <button
                        type="button"
                        aria-label="Next testimonial"
                        onClick={() => go(1)}
                        className="h-10 w-10 rounded-full border border-line hover:bg-panel">
                        ›
                    </button>
                </div>
            </div>
        </section>
    );
}
