import { useState } from 'react';

const questions = [
    {
        question: 'How do I start searching for a property with Urbanouse?',
        answer: 'You can begin by using our property search tool, which allows you to filter by location, property type, price range, and other features. Once you find a property you’re interested in, simply open it to learn more or schedule a visit.',
    },
    {
        question: 'What services does Urbanouse offer for first-time homebuyers?',
        answer: 'We offer a comprehensive range of services including mortgage advisory, property viewings, legal guidance, and dedicated support throughout the entire buying process.',
    },
    {
        question: 'Can Urbanouse help me sell my property?',
        answer: 'Absolutely. Our experienced agents will provide a free valuation, professional photography, and a targeted marketing strategy to sell your property quickly and at the best price.',
    },
    {
        question: 'What types of properties does Urbanouse specialize in?',
        answer: 'We specialize in a wide variety of properties ranging from luxury apartments and family homes to exclusive villas.',
    },
    {
        question: 'Can I schedule a visit to view properties?',
        answer: 'Yes, you can easily schedule a viewing directly through our website: open any property listing and choose “Tour in person” or “Request showing”, or reach out to our support team.',
    },
];

export default function Faq() {
    const [open, setOpen] = useState<number | null>(0); 

    return (
        <section className="section">
            <div className="wrapper flex flex-col gap-12 lg:flex-row lg:gap-24">
                <div className="order-2 w-full border-t border-line lg:order-1 lg:w-1/2">
                    {questions.map((item, index) => (
                        <div key={item.question} className="border-b border-line py-5 sm:py-6">
                            <button type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-6 text-left">
                                <span className="text-base font-medium sm:text-lg">{item.question}</span>
                                <span aria-hidden className="text-xl">{open === index ? '−' : '+'}</span>
                            </button>
                            {open === index && <p className="mt-4 pr-8 leading-relaxed text-muted">{item.answer}</p>}
                        </div>
                    ))}
                </div>

                <div className="order-1 w-full lg:order-2 lg:w-1/2 lg:pt-12 lg:text-right">
                    <span className="tag mb-6">FAQ’s</span>
                    <h2 className="title mb-6">Frequently Asked Questions</h2>
                    <p className="subtitle lg:ml-auto">Have questions about buying, selling, or renting with Urbanouse? We’ve got the answers to help guide you through the process.</p>
                </div>
            </div>
        </section>
    );
}
