import type { Request } from 'express';
import type { User } from './models';

/* ---------- формат ответов API ---------- */

export interface ApiError {
    success: false;
    error: string;
}

// Ответ с данными: { success, message?, data }
export interface DataSuccess<T> {
    success: true;
    message?: string;
    data: T;
}

// Ответ без данных: { success, message }
export interface MessageSuccess {
    success: true;
    message: string;
}

export type ApiResponse<T> = DataSuccess<T> | ApiError;
export type MessageResponse = MessageSuccess | ApiError;

// Пользователь, которого возвращает /login
export type LoginUser = Pick<
    User,
    'id' | 'first_name' | 'last_name' | 'email' | 'role' | 'phone' | 'avatar_url'
>;

export interface RegisterSuccess {
    success: true;
    token: string;
    user: User;
}
export type RegisterResponse = RegisterSuccess | ApiError;

export interface LoginSuccess {
    success: true;
    token: string;
    user: LoginUser;
}
export type LoginResponse = LoginSuccess | ApiError;

export interface MeSuccess {
    success: true;
    user: User;
}
export type MeResponse = MeSuccess | ApiError;

/* ---------- параметры пути ---------- */

// Именно type, а не interface: иначе Express не примет их как ParamsDictionary
export type NoParams = Record<string, string>;
export type IdParams = { id: string };
export type PropertyIdParams = { propertyId: string };

// Request с типизированными параметрами пути и телом запроса
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Req<P = NoParams, B = unknown> = Request<P, any, B>;

/* ---------- тела запросов ---------- */
// Всё необязательное: клиент может прислать что угодно, поля проверяются в маршрутах

export interface RegisterBody {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string;
}

export interface LoginBody {
    email?: string;
    password?: string;
}

export interface CreateUserBody {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string | null;
}

export interface UpdateUserBody {
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    is_active?: boolean;
}

export interface CountryBody {
    name?: string;
    code?: string;
}

export interface CityBody {
    country_id?: number | string;
    name?: string;
}

// Одинаково для property_types и amenities
export interface SlugNameBody {
    slug?: string;
    name?: string;
}

export interface CreateAgentBody {
    user_id?: string | number | null;
    first_name?: string;
    last_name?: string;
    title?: string | null;
    bio?: string | null;
    photo_url?: string | null;
    email?: string | null;
    phone?: string | null;
    city_id?: number | string | null;
    rating?: number | string | null;
    properties_sold?: number | null;
}

export interface UpdateAgentBody extends CreateAgentBody {
    is_active?: boolean;
}

export interface CreateProjectBody {
    slug?: string;
    title?: string;
    description?: string | null;
    city_id?: number | string | null;
    cover_url?: string | null;
    units_available?: number | null;
    is_published?: boolean | null;
}

export type UpdateProjectBody = CreateProjectBody;

export interface PropertyBody {
    slug?: string;
    title?: string;
    description?: string | null;
    listing_type?: string;
    status?: string | null;
    property_type_id?: number | string;
    agent_id?: string | number | null;
    price?: number | string;
    currency?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area_sqft?: number | null;
    garage_spaces?: number | null;
    year_built?: number | null;
    address_line?: string;
    city_id?: number | string;
    postal_code?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    is_featured?: boolean | null;
    is_popular?: boolean | null;
    project_id?: string | number | null;
}

export interface PropertyImageBody {
    url?: string;
    alt_text?: string | null;
    sort_order?: number;
    is_cover?: boolean;
}

export interface AmenityIdsBody {
    amenity_ids?: number[];
}

export interface FavoriteBody {
    property_id?: string | number;
}

export interface SavedSearchBody {
    name?: string | null;
    listing_type?: string | null;
    city_id?: number | string | null;
    property_type_id?: number | string | null;
    min_bedrooms?: number | null;
    max_price?: number | string | null;
    alerts_enabled?: boolean | null;
}

export interface InquiryBody {
    property_id?: string | number;
    type?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    message?: string | null;
    preferred_at?: string | null;
    offer_amount?: number | string | null;
}

export interface InquiryStatusBody {
    status?: string;
}

export interface ContactMessageBody {
    name?: string | null;
    email?: string;
    phone?: string | null;
    message?: string;
}

export interface ContactHandledBody {
    is_handled?: boolean;
}

/* ---------- query-параметры (в URL всё приходит строками) ---------- */

export type CitiesQuery = { country_id?: string };
export type AgentsQuery = { city_id?: string };
export type InquiriesQuery = { status?: string };
export type ContactMessagesQuery = { is_handled?: string };

export type PropertiesQuery = {
    listing_type?: string;
    city_id?: string;
    property_type_id?: string;
    agent_id?: string;
    min_price?: string;
    max_price?: string;
    min_bedrooms?: string;
    is_featured?: string;
    is_popular?: string;
};
