import About from './About/About';
import Discover from './Discover/Discover';
import Faq from './FAQ/FAQ';
import Hero from './Hero/Hero';
import Meet from './Meet/Meet';
import Statistics from './Statistic/Statistic';
import Testimonial from './Testimonial/Testimonial';
import SearchBar from '../../Components/SearchBar';

export default function Home() {
    return (
        <>
            <Hero />

            <section className="w-full py-16 lg:py-20">
                <div className="wrapper flex flex-col items-center">
                    <h2 className="mb-4 text-center text-4xl font-semibold sm:text-5xl">
                        Find Your Dream Property
                    </h2>
                    <p className="mb-12 max-w-md text-center text-lg text-muted">
                        We offer modern properties with the best quality that meet all your needs.
                    </p>
                    <div className="w-full max-w-6xl">
                        <SearchBar />
                    </div>
                </div>
            </section>

            <About />
            <Statistics />
            <Discover />
            <Meet />
            <Testimonial />
            <Faq />
        </>
    );
}
