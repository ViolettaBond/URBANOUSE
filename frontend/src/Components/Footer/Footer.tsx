import { Link } from 'react-router-dom';
import { houses } from '../../houses';

const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About us' },
    { to: '/properties', label: 'Properties' },
    { to: '/agents', label: 'Agents' },
    { to: '/projects', label: 'Projects' },
    { to: '/contacts', label: 'Contact us' },
];

export default function Footer() {
    return (
        <footer className="w-full bg-[#090C1B] text-white">
            <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden py-20 lg:min-h-[600px]">
                <img
                    src={houses[2].main}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative flex flex-col items-center px-6 text-center">
                    <h2 className="mb-4 max-w-3xl text-4xl font-semibold leading-[1.1] md:text-5xl lg:text-[56px]">
                        Ready to Find Your Dream Home with Urbanouse?
                    </h2>
                    <p className="mb-10 max-w-xl text-base text-gray-300 md:text-lg">
                        Join thousands of happy homeowners who found their perfect residence with
                        us. Let’s make your property journey smooth and successful.
                    </p>
                    <Link
                        to="/contacts"
                        className="rounded-full border border-white/40 px-6 py-3 text-sm font-medium hover:bg-white hover:text-black">
                        Let’s work together →
                    </Link>
                </div>
            </div>

            <div className="wrapper pb-8 pt-16 lg:pt-20">
                <div className="mb-16 flex flex-col justify-between gap-12 lg:flex-row">
                    <address className="flex flex-col gap-3 text-sm font-medium uppercase not-italic">
                        <p>2223 Calle Deal Cala Salamanca</p>
                        <p>Madrid, 28028</p>
                        <a href="tel:+34123456789" className="hover:text-gray-300">
                            (+34) 123-456-789
                        </a>
                    </address>
                    <div>
                        <p className="mb-2 text-xs uppercase text-gray-400">Get in touch</p>
                        <a
                            href=""
                            className="break-all text-2xl font-medium hover:text-gray-300 md:text-3xl lg:text-4xl">
                            marketing@urbanouse.com
                        </a>
                    </div>
                </div>

                <ul className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-sm font-medium uppercase">
                    {links.map((link) => (
                        <li key={link.to}>
                            <Link to={link.to} className="hover:text-gray-400">
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <p className="mb-10 select-none overflow-hidden whitespace-nowrap text-center text-6xl sm:text-8xl md:text-9xl font-bold leading-none tracking-tighter">
                    Urbanouse
                </p>

                <p className="border-t border-white/10 pt-6 text-center text-xs uppercase text-gray-400 md:text-left md:text-sm">
                    ©{new Date().getFullYear()} Urbanouse. All rights reserved
                </p>
            </div>
        </footer>
    );
}
