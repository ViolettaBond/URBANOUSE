import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import FavoriteButton from '../../Components/FavoriteButton';
import Modal from '../../Components/Modal';
import PropertyMap from '../../Components/PropertyMap';
import { houseFor } from '../../houses';
import type { Agent, PropertyFull } from '../../types';
import Calculator from './Calculator';
import InquiryForm from './InquiryForm';
import PopularProperties from './PopularProperties';

export default function PropertyDetails() {
    const { id = '' } = useParams();
    const [property, setProperty] = useState<PropertyFull | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [status, setStatus] = useState<'loading' | 'notfound' | 'error' | 'ok'>('loading');

    const [tourType, setTourType] = useState('tour_in_person');
    const [form, setForm] = useState('');
    const [calculator, setCalculator] = useState(false);
    const [photo, setPhoto] = useState<number | null>(null);

    useEffect(() => {
        setStatus('loading');
        fetch(`/api/properties/${id}`)
            .then((res) => res.json())
            .then((json) => {
                if (!json.success) return setStatus('notfound');
                setProperty(json.data);
                setStatus('ok');
                document.title = `${json.data.title} — Urbanouse`;
                if (json.data.agent_id) {
                    fetch(`/api/agents/${json.data.agent_id}`)
                        .then((res) => res.json())
                        .then((a) => setAgent(a.data));
                }
            })
            .catch(() => setStatus('error'));
    }, [id]);

    if (status === 'loading') return <div className="wrapper py-24 text-muted">Loading…</div>;
    if (status === 'error')
        return (
            <div className="wrapper py-24">
                <p className="error">Could not load the property. Is the backend running?</p>
            </div>
        );
    if (status === 'notfound' || !property) {
        return (
            <div className="wrapper flex flex-col items-start gap-4 py-24">
                <h1 className="text-4xl font-semibold">Property not found</h1>
                <Link to="/properties/list" className="btn">
                    Browse properties
                </Link>
            </div>
        );
    }

    const house = houseFor(property.id);
    const photos = [
        { src: house.main, label: 'Building view' },
        ...house.layouts.map((src, i) => ({ src, label: `Floor plan ${i + 1}` })),
    ];

    const isSale = property.listing_type === 'sale';
    const overview = [
        property.property_type,
        `${property.bedrooms} bedrooms`,
        `${property.bathrooms} bathrooms`,
        `${property.area_sqft} sq.ft`,
        property.garage_spaces > 0 ? `${property.garage_spaces} car garage` : '',
        property.year_built ? `Built in ${property.year_built}` : '',
        ...property.amenities.filter((a) => a.slug !== 'garage').map((a) => a.name),
    ].filter(Boolean);

    return (
        <>
            <section className="w-full py-8 lg:py-12">
                <div className="wrapper">
                    <p className="mb-6 text-sm text-muted">
                        <Link to="/properties" className="hover:text-ink">
                            Properties
                        </Link>
                        /{' '}
                        <Link
                            to={`/properties/list?city_id=${property.city_id}`}
                            className="hover:text-ink">
                            {property.city}
                        </Link>
                    </p>

                    <div className="grid h-[260px] grid-cols-4 grid-rows-2 gap-3 sm:h-[400px] lg:h-[520px]">
                        <button
                            type="button"
                            onClick={() => setPhoto(0)}
                            aria-label="Open photos"
                            className="col-span-4 row-span-2 overflow-hidden rounded-3xl bg-panel sm:col-span-2">
                            <img
                                src={photos[0].src}
                                alt={property.title}
                                className="h-full w-full object-cover"
                            />
                        </button>
                        {photos.slice(1, 5).map((item, index) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => setPhoto(index + 1)}
                                aria-label={item.label}
                                className="hidden overflow-hidden rounded-3xl bg-panel sm:block">
                                <img
                                    src={item.src}
                                    alt={item.label}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-12">
                        <div className="min-w-0">
                            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="mb-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                                        {property.title}
                                    </h1>
                                    <p className="text-muted">
                                        {property.address_line}, {property.city},{' '}
                                        {property.postal_code}
                                    </p>
                                </div>
                                <FavoriteButton propertyId={property.id} withText />
                            </div>

                            <p className="mb-10 max-w-3xl whitespace-pre-line leading-relaxed">
                                {property.description ?? 'No description yet.'}
                            </p>

                            <h2 className="mb-4 text-lg font-semibold">Overview</h2>
                            <ul className="mb-10 grid max-w-xl gap-3 rounded-2xl border border-line p-5 sm:grid-cols-2">
                                {overview.map((item) => (
                                    <li key={item} className="text-sm">
                                        • {item}
                                    </li>
                                ))}
                            </ul>

                            <h2 className="mb-4 text-lg font-semibold">Location</h2>
                            <PropertyMap
                                properties={[property]}
                                single
                                className="z-0 h-[320px] w-full overflow-hidden rounded-3xl"
                            />
                        </div>

                        <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
                            <div className="rounded-3xl border border-line p-6">
                                <p className="mb-1 text-lg font-semibold">
                                    {isSale ? 'Price' : 'Rent'}
                                </p>
                                <p className="mb-5 text-3xl font-semibold">
                                    ${Number(property.price).toLocaleString('en-US')}
                                </p>
                                {isSale && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setCalculator(!calculator)}
                                            className="btn-outline w-full">
                                            Payment calculator
                                        </button>
                                        {calculator && (
                                            <Calculator price={Number(property.price)} />
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col gap-4 rounded-3xl border border-line p-6">
                                <h2 className="text-lg font-semibold">
                                    {isSale ? 'Thinking of buying?' : 'Thinking of renting?'}
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        aria-pressed={tourType === 'tour_in_person'}
                                        onClick={() => setTourType('tour_in_person')}
                                        className={`pill ${tourType === 'tour_in_person' ? 'pill-active' : ''}`}>
                                        Tour in person
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={tourType === 'tour_video'}
                                        onClick={() => setTourType('tour_video')}
                                        className={`pill ${tourType === 'tour_video' ? 'pill-active' : ''}`}>
                                        Video chat
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm(tourType)}
                                    className="btn-outline w-full">
                                    Request showing
                                </button>
                                {isSale && (
                                    <button
                                        type="button"
                                        onClick={() => setForm('offer')}
                                        className="btn w-full">
                                        Start an offer
                                    </button>
                                )}
                            </div>

                            {agent && (
                                <div className="flex flex-col gap-5 rounded-3xl border border-line p-6">
                                    <h2 className="text-lg font-semibold">Ask Agent a Question</h2>
                                    <div className="flex items-center gap-4">
                                        {agent.photo_url && (
                                            <img
                                                src={agent.photo_url}
                                                alt=""
                                                onError={(e) =>
                                                    (e.currentTarget.style.display = 'none')
                                                }
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                {agent.first_name} {agent.last_name}
                                            </p>
                                            <p className="truncate text-sm text-muted">
                                                {agent.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm('message_agent')}
                                            className="btn-outline !px-2">
                                            Message
                                        </button>
                                        {agent.phone ? (
                                            <a
                                                href={`tel:${agent.phone.replace(/\s+/g, '')}`}
                                                className="btn-outline !px-2">
                                                Call
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setForm('call_request')}
                                                className="btn-outline !px-2">
                                                Request a call
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>

            <PopularProperties />

            {form && (
                <InquiryForm
                    key={form}
                    type={form}
                    propertyId={property.id}
                    propertyTitle={property.title}
                    onClose={() => setForm('')}
                />
            )}

            {photo !== null && (
                <Modal title={photos[photo].label} onClose={() => setPhoto(null)} wide>
                    <img
                        src={photos[photo].src}
                        alt={photos[photo].label}
                        className="mb-4 max-h-[65vh] w-full rounded-2xl object-contain"
                    />
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setPhoto((photo - 1 + photos.length) % photos.length)}
                            className="pill">
                            Previous
                        </button>
                        <span className="text-sm text-muted">
                            {photo + 1} / {photos.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPhoto((photo + 1) % photos.length)}
                            className="pill">
                            Next
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
