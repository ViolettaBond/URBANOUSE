export type Id = string | number;

export interface Property {
    id: Id;
    title: string;
    description: string | null;
    listing_type: 'sale' | 'rent';
    property_type_id: number;
    agent_id: Id | null;
    price: string;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    area_sqft: number | null;
    garage_spaces: number;
    year_built: number | null;
    address_line: string;
    city_id: number;
    postal_code: string | null;
    latitude: string | null;
    longitude: string | null;
    is_featured: boolean;
    is_popular: boolean;
    city: string;
    property_type: string;
    cover_url: string | null;
}

export interface PropertyImage {
    id: Id;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_cover: boolean;
}

export interface PropertyFull extends Omit<Property, 'cover_url'> {
    images: PropertyImage[];
    amenities: { id: number; slug: string; name: string }[];
}

export interface Agent {
    id: Id;
    first_name: string;
    last_name: string;
    title: string;
    photo_url: string | null;
    email: string | null;
    phone: string | null;
    city_id: number | null;
    city: string | null;
    rating: string | null;
    properties_sold: number;
}

export interface Project {
    id: Id;
    title: string;
    description: string | null;
    city_id: number | null;
    cover_url: string | null;
    units_available: number;
    is_published: boolean;
}

export interface City {
    id: number;
    country_id: number;
    name: string;
}

export interface Country {
    id: number;
    name: string;
}

export interface PropertyType {
    id: number;
    name: string;
}

export interface Inquiry {
    id: Id;
    property_id: Id;
    type: string;
    status: 'new' | 'in_progress' | 'done' | 'cancelled';
    message: string | null;
    offer_amount: string | null;
    created_at: string;
    property_title?: string;
}

export interface User {
    first_name: string;
    last_name: string;
    email: string;
    role: 'user' | 'agent' | 'admin';
    phone?: string | null;
}
