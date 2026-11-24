import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import wordmark from '../../../assets/Urbanouse.svg';
import heroImage from '../../../assets/urbane-house-hero.png';
import type { Property } from '../../../types';

export default function Hero() {
    const [featured, setFeatured] = useState<Property[]>([]); 
    const [index, setIndex] = useState(0); 

    useEffect(() => {
        fetch('/api/properties?is_featured=true')
            .then((res) => res.json())
            .then((json) => setFeatured(json.data));
    }, []);

    const current = featured[index];
    const go = (step: number) => setIndex((index + step + featured.length) % featured.length);

    return (
        <section className="w-full bg-gradient-to-b from-[#E6ECF4]/80 to-page pt-6 dark:from-white/5 lg:pt-10">
            <div className="wrapper">
                <h1 className="sr-only">Urbanouse — find your dream property</h1>
                <img src={wordmark} alt="" className="w-full dark:brightness-110 dark:grayscale dark:invert" />
            </div>

            <div className="relative mt-4 lg:mt-6">
                <img src={heroImage} alt="Modern house" className="h-[460px] w-full object-cover object-top sm:h-[600px] lg:h-[760px]" />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent pb-6 pt-28 lg:pb-10">
                    <div className="wrapper flex flex-col gap-6 text-white lg:flex-row lg:items-end lg:justify-between">
                        <p className="max-w-md text-lg font-medium lg:text-2xl">
                            Discover meticulously crafted homes and properties, blending contemporary aesthetics with sustainable living.
                        </p>

                        {current && (
                            <div className="flex flex-col gap-4 lg:items-end lg:text-right">
                                {featured.length > 1 && (
                                    <div className="flex gap-4">
                                        <button type="button" aria-label="Previous property" onClick={() => go(-1)} className="h-11 w-11 rounded-full border border-white hover:bg-white hover:text-black">←</button>
                                        <button type="button" aria-label="Next property" onClick={() => go(1)} className="h-11 w-11 rounded-full border border-white hover:bg-white hover:text-black">→</button>
                                    </div>
                                )}
                                <Link to={`/properties/${current.id}`} className="group">
                                    <b className="block text-xl font-semibold group-hover:underline lg:text-2xl">{current.title}</b>
                                    <span className="block text-base text-white/90 lg:text-xl">{current.address_line}, {current.city}</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
