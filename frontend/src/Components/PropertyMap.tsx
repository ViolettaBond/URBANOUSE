import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Property } from '../types';

interface Props {
    properties: Pick<Property, 'id' | 'title' | 'price' | 'latitude' | 'longitude'>[];
    className?: string;
    single?: boolean;
    onSelect?: (id: string | number) => void;
}

export default function PropertyMap({
    properties,
    className = '',
    single = false,
    onSelect,
}: Props) {
    const box = useRef<HTMLDivElement>(null);
    const key = properties.map((p) => p.id).join(',');

    useEffect(() => {
        if (!box.current) return;
        const map = L.map(box.current, { scrollWheelZoom: false }).setView([30, 0], 2);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const points: L.LatLngTuple[] = [];
        for (const property of properties) {
            if (!property.latitude || !property.longitude) continue;
            const point: L.LatLngTuple = [Number(property.latitude), Number(property.longitude)];
            points.push(point);

            const price =
                '$' +
                Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(property.price));
            const marker = L.marker(point, {
                icon: L.divIcon({
                    html: `<div class="price-pin">${price}</div>`,
                    className: '',
                    iconSize: [0, 0],
                }),
            }).addTo(map);

            const tip = document.createElement('span');
            tip.textContent = property.title;
            marker.bindTooltip(tip, { direction: 'top', offset: [0, -16], permanent: single });
            marker.on('click', () => onSelect?.(property.id));
        }

        if (points.length === 1) map.setView(points[0], single ? 16 : 13);
        if (points.length > 1)
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });

        return () => {
            map.remove();
        };
    }, [key, single]);

    return <div ref={box} className={className} />;
}
