import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <section className="section">
            <div className="wrapper flex flex-col items-start gap-6">
                <p className="text-sm font-medium text-muted">404</p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                    This page doesn’t exist
                </h1>
                <p className="max-w-md text-lg text-muted">The link may be outdated or mistyped.</p>
                <Link to="/" className="btn">
                    Back to home
                </Link>
            </div>
        </section>
    );
}
