import '../../index.css';
import About from './About/About';
import Discover from './Discover/Discover';
import FindProperty from './FindProperty/FindProperty';
import Hero from './Hero/Hero';
import Statistics from './Statistic/Statistic';

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <FindProperty />
                <About />
                <Statistics />
                <Discover />
            </main>
        </>
    );
}
