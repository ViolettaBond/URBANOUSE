import { Link } from 'react-router-dom';
import { houseFor } from '../houses';
import type { Property } from '../types';
import FavoriteButton from './FavoriteButton';

interface Props {
    property: Property;
    className?: string;
    onFavoriteChange?: (active: boolean) => void;
}

export default function PropertyCard({ property, className = '', onFavoriteChange }: Props) {
    const link = `/properties/${property.id}`;

    return (
        <article className={`flex min-w-0 flex-col gap-4 ${className}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-panel">
                <Link to={link}>
                    <img
                        src={houseFor(property.id).main}
                        alt={property.title}
                        loading="lazy"
                        className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                </Link>
                <span className="absolute left-4 top-4 rounded-2xl bg-[#090C1B] px-4 py-2 text-xs font-medium uppercase text-white">
                    {property.listing_type === 'rent' ? 'For rent' : 'For sale'}
                </span>
                <FavoriteButton
                    propertyId={property.id}
                    onChange={onFavoriteChange}
                    className="absolute right-4 top-4"
                />
            </div>

            <div>
                <p className="text-2xl font-semibold sm:text-3xl">
                    ${Number(property.price).toLocaleString('en-US')}
                </p>
                <h3 className="text-lg font-semibold sm:text-xl">
                    <Link to={link} className="hover:underline">
                        {property.title}
                    </Link>
                </h3>
                <p className="mb-2 text-sm text-muted sm:text-base">
                    {property.address_line}
                    <br />
                    {property.city}, {property.postal_code}
                </p>
                <p className="text-sm text-muted">
                    {property.bedrooms} beds · {property.bathrooms} bath · {property.area_sqft}{' '}
                    sq.ft
                </p>
            </div>
        </article>
    );
}
