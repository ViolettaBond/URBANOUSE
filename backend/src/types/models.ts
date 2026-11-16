// Интерфейсы строк таблиц БД.
//
// Как драйвер pg приводит типы PostgreSQL к JS:
//   BIGINT, NUMERIC (id, price, latitude, rating...) -> string
//   SMALLINT, INT                                    -> number
//   TIMESTAMPTZ                                      -> Date (в JSON уходит строкой ISO)
//   VARCHAR, TEXT, CITEXT, CHAR                      -> string
//   NULL в БД                                        -> null

/* ---------- enum-типы из SQL ---------- */

export type UserRole = 'user' | 'agent' | 'admin';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'active' | 'sold' | 'rented' | 'archived';
export type InquiryType =
    | 'request_showing'
    | 'tour_in_person'
    | 'tour_video'
    | 'ask_question'
    | 'message_agent'
    | 'call_request'
    | 'offer';
export type InquiryStatus = 'new' | 'in_progress' | 'done' | 'cancelled';

/* ---------- users ---------- */

// Публичные поля пользователя (без password_hash)
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
    phone: string | null;
    avatar_url: string | null;
    email_verified_at: Date | null;
    last_login_at: Date | null;
    created_at: Date;
}

// Пользователь, которого middleware auth кладёт в req.user
export interface AuthUser extends User {
    is_active: boolean;
}

// Полная строка таблицы users
export interface UserRow extends AuthUser {
    password_hash: string | null;
    updated_at: Date;
}

// Что лежит внутри JWT
export interface TokenPayload {
    id: string;
    role: UserRole;
}

/* ---------- справочники ---------- */

export interface Country {
    id: number;
    name: string;
    code: string | null;
}

export interface City {
    id: number;
    country_id: number;
    name: string;
}

export interface PropertyType {
    id: number;
    slug: string;
    name: string;
}

export interface Amenity {
    id: number;
    slug: string;
    name: string;
}

/* ---------- agents ---------- */

export interface Agent {
    id: string;
    user_id: string | null;
    first_name: string;
    last_name: string;
    title: string;
    bio: string | null;
    photo_url: string | null;
    email: string | null;
    phone: string | null;
    city_id: number | null;
    rating: string | null; // NUMERIC(2,1)
    properties_sold: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface AgentWithCity extends Agent {
    city: string | null;
}

/* ---------- projects ---------- */

export interface Project {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    city_id: number | null;
    cover_url: string | null;
    units_available: number;
    is_published: boolean;
    created_at: Date;
    updated_at: Date;
}

/* ---------- properties ---------- */

export interface Property {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    listing_type: ListingType;
    status: PropertyStatus;
    property_type_id: number;
    agent_id: string | null;
    price: string; // NUMERIC(14,2)
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
    views_count: number;
    project_id: string | null;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface PropertyImage {
    id: string;
    property_id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_cover: boolean;
}

// Строка списка объектов (GET /properties)
export interface PropertyListItem extends Property {
    city: string;
    property_type: string;
    cover_url: string | null;
}

// Краткие данные удобства внутри карточки объекта
export interface AmenityBrief {
    id: number;
    slug: string;
    name: string;
}

// Карточка объекта (GET /properties/:id)
export interface PropertyDetails extends Property {
    city: string;
    property_type: string;
    images: Omit<PropertyImage, 'property_id'>[];
    amenities: AmenityBrief[];
}

/* ---------- favorites ---------- */

export interface Favorite {
    user_id: string;
    property_id: string;
    created_at: Date;
}

// Объект в списке избранного
export interface FavoriteProperty extends Property {
    city: string;
    cover_url: string | null;
}

/* ---------- saved_searches ---------- */

export interface SavedSearch {
    id: string;
    user_id: string;
    name: string | null;
    listing_type: ListingType | null;
    city_id: number | null;
    property_type_id: number | null;
    min_bedrooms: number | null;
    max_price: string | null;
    alerts_enabled: boolean;
    created_at: Date;
}

/* ---------- inquiries ---------- */

export interface Inquiry {
    id: string;
    property_id: string;
    agent_id: string | null;
    user_id: string | null;
    type: InquiryType;
    status: InquiryStatus;
    name: string | null;
    email: string | null;
    phone: string | null;
    message: string | null;
    preferred_at: Date | null;
    offer_amount: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface InquiryWithProperty extends Inquiry {
    property_title: string;
}

/* ---------- contact_messages ---------- */

export interface ContactMessage {
    id: string;
    user_id: string | null;
    name: string | null;
    email: string;
    phone: string | null;
    message: string;
    is_handled: boolean;
    created_at: Date;
}

/* ---------- таблицы вне SQL-схемы ---------- */

// primery_card_info, sold__slider_info, articles_info: структура неизвестна
export type ContentRow = Record<string, unknown>;
