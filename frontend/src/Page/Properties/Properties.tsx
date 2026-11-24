import { useEffect } from 'react';
import SearchBar from '../../Components/SearchBar';
import Discover from '../Home/Discover/Discover';
import Faq from '../Home/FAQ/FAQ';
import PopularProperties from './PopularProperties';

export default function Properties() {
    useEffect(() => {
        document.title = 'Properties — Urbanouse';
    }, []);

    return (
        <>
            <section className="w-full py-16 lg:py-20">
                <div className="wrapper flex flex-col items-center">
                    <h1 className="mb-4 text-center text-4xl font-semibold sm:text-5xl">Find Your Dream Property</h1>
                    <p className="mb-12 max-w-md text-center text-lg text-muted">We offer modern properties with the best quality that meet all your needs.</p>
                    <div className="w-full max-w-6xl">
                        <SearchBar />
                    </div>
                </div>
            </section>

            <Discover tag="Featured Properties" title="Explore Our Handpicked Properties" featuredOnly />
            <PopularProperties />
            <Faq />
        </>
    );
}
