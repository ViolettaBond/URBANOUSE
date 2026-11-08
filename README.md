BEGIN;

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role        AS ENUM ('user', 'agent', 'admin');
CREATE TYPE listing_type     AS ENUM ('sale', 'rent');
CREATE TYPE property_status  AS ENUM ('draft', 'active', 'sold', 'rented', 'archived');
CREATE TYPE oauth_provider   AS ENUM ('google', 'apple');
CREATE TYPE inquiry_type     AS ENUM (
    'request_showing',
    'tour_in_person',
    'tour_video',
    'ask_question',
    'message_agent',
    'call_request',
    'offer'
);
CREATE TYPE inquiry_status   AS ENUM ('new', 'in_progress', 'done', 'cancelled');

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    email          CITEXT       NOT NULL UNIQUE,
    password_hash  TEXT,
    role           user_role    NOT NULL DEFAULT 'user',
    phone          VARCHAR(30),
    avatar_url     TEXT,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMPTZ,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE oauth_accounts (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         oauth_provider NOT NULL,
    provider_user_id VARCHAR(255)   NOT NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id)
);
CREATE INDEX idx_oauth_user ON oauth_accounts(user_id);

CREATE TABLE password_reset_tokens (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);

CREATE TABLE countries (
    id    SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE,
    code  CHAR(2)      UNIQUE
);

CREATE TABLE cities (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country_id  SMALLINT     NOT NULL REFERENCES countries(id),
    name        VARCHAR(120) NOT NULL,
    UNIQUE (country_id, name)
);

CREATE TABLE property_types (
    id    SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug  VARCHAR(50)  NOT NULL UNIQUE,
    name  VARCHAR(100) NOT NULL
);

CREATE TABLE amenities (
    id    SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug  VARCHAR(50)  NOT NULL UNIQUE,
    name  VARCHAR(100) NOT NULL
);

CREATE TABLE agents (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          BIGINT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    title            VARCHAR(150) NOT NULL DEFAULT 'Senior Real Estate Advisor',
    bio              TEXT,
    photo_url        TEXT,
    email            CITEXT,
    phone            VARCHAR(30),
    city_id          INT REFERENCES cities(id),
    rating           NUMERIC(2,1) CHECK (rating BETWEEN 0 AND 5),
    properties_sold  INT NOT NULL DEFAULT 0 CHECK (properties_sold >= 0),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_agents_city ON agents(city_id);
CREATE INDEX idx_agents_name ON agents(last_name, first_name);
CREATE TRIGGER trg_agents_updated BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE properties (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug             VARCHAR(200) NOT NULL UNIQUE,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    listing_type     listing_type    NOT NULL,
    status           property_status NOT NULL DEFAULT 'active',
    property_type_id SMALLINT NOT NULL REFERENCES property_types(id),
    agent_id         BIGINT   REFERENCES agents(id) ON DELETE SET NULL,

    price            NUMERIC(14,2) NOT NULL CHECK (price >= 0),
    currency         CHAR(3)       NOT NULL DEFAULT 'USD',

    bedrooms         SMALLINT NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
    bathrooms        SMALLINT NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
    area_sqft        INT      CHECK (area_sqft > 0),
    garage_spaces    SMALLINT NOT NULL DEFAULT 0 CHECK (garage_spaces >= 0),
    year_built       SMALLINT CHECK (year_built BETWEEN 1800 AND 2100),

    address_line     VARCHAR(255) NOT NULL,
    city_id          INT          NOT NULL REFERENCES cities(id),
    postal_code      VARCHAR(20),
    latitude         NUMERIC(9,6),
    longitude        NUMERIC(9,6),

    is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
    is_popular       BOOLEAN NOT NULL DEFAULT FALSE,
    views_count      INT     NOT NULL DEFAULT 0,

    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prop_search ON properties (status, listing_type, city_id, property_type_id, bedrooms, price);
CREATE INDEX idx_prop_price     ON properties (price);
CREATE INDEX idx_prop_agent     ON properties (agent_id);
CREATE INDEX idx_prop_featured  ON properties (is_featured) WHERE is_featured;
CREATE INDEX idx_prop_popular   ON properties (is_popular)  WHERE is_popular;
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE property_images (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id  BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url          TEXT   NOT NULL,
    alt_text     VARCHAR(255),
    sort_order   SMALLINT NOT NULL DEFAULT 0,
    is_cover     BOOLEAN  NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_pimg_property ON property_images(property_id, sort_order);

CREATE UNIQUE INDEX uq_pimg_cover ON property_images(property_id) WHERE is_cover;

CREATE TABLE property_amenities (
    property_id BIGINT   NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id  SMALLINT NOT NULL REFERENCES amenities(id)  ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE projects (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    city_id      INT REFERENCES cities(id),
    cover_url    TEXT,
    units_available INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE properties
    ADD COLUMN project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_prop_project ON properties(project_id);

CREATE TABLE favorites (
    user_id      BIGINT NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
    property_id  BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, property_id)
);
CREATE INDEX idx_fav_property ON favorites(property_id);

CREATE TABLE saved_searches (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(150),
    listing_type    listing_type,
    city_id         INT REFERENCES cities(id),
    property_type_id SMALLINT REFERENCES property_types(id),
    min_bedrooms    SMALLINT,
    max_price       NUMERIC(14,2),
    alerts_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ss_user ON saved_searches(user_id);

CREATE TABLE inquiries (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id   BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id      BIGINT REFERENCES agents(id) ON DELETE SET NULL,
    user_id       BIGINT REFERENCES users(id)  ON DELETE SET NULL,
    type          inquiry_type   NOT NULL,
    status        inquiry_status NOT NULL DEFAULT 'new',
    name          VARCHAR(200),
    email         CITEXT,
    phone         VARCHAR(30),
    message       TEXT,
    preferred_at  TIMESTAMPTZ,
    offer_amount  NUMERIC(14,2) CHECK (offer_amount > 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);
CREATE INDEX idx_inq_property ON inquiries(property_id);
CREATE INDEX idx_inq_agent    ON inquiries(agent_id, status);
CREATE INDEX idx_inq_user     ON inquiries(user_id);
CREATE TRIGGER trg_inquiries_updated BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE contact_messages (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    name        VARCHAR(200),
    email       CITEXT NOT NULL,
    phone       VARCHAR(30),
    message     TEXT   NOT NULL,
    is_handled  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO property_types (slug, name) VALUES
    ('family-house', 'Family House'),
    ('villa',        'Villa'),
    ('apartment',    'Apartment');

INSERT INTO amenities (slug, name) VALUES
    ('pool',   'Pool'),
    ('garage', 'Garage');

INSERT INTO countries (name, code) VALUES
    ('United Kingdom', 'GB'),
    ('Spain',          'ES'),
    ('Portugal',       'PT'),
    ('Italy',          'IT'),
    ('United States',  'US'),
    ('Australia',      'AU'),
    ('Canada',         'CA'),
    ('Germany',        'DE');

INSERT INTO cities (country_id, name)
SELECT co.id, v.city
FROM (VALUES
    ('GB', 'London'),
    ('GB', 'Manchester'),
    ('ES', 'Madrid'),
    ('PT', 'Lisbon'),
    ('IT', 'Roma'),
    ('US', 'New York'),
    ('US', 'Los Angeles'),
    ('US', 'Chicago'),
    ('US', 'New Orleans'),
    ('AU', 'Sydney'),
    ('CA', 'Toronto'),
    ('DE', 'Berlin')
) AS v(code, city)
JOIN countries co ON co.code = v.code;

INSERT INTO users (first_name, last_name, email, password_hash, role, phone, email_verified_at) VALUES
    ('Admin', 'Urbanouse', 'admin@urbanouse.com',
        crypt('Password123!', gen_salt('bf', 10)), 'admin', NULL,               now()),
    ('Jane',  'Doe',       'jane.doe@urbanouse.com',
        crypt('Password123!', gen_salt('bf', 10)), 'agent', '+44 20 7946 0001', now()),
    ('Anna',  'Petrova',   'anna@example.com',
        crypt('Password123!', gen_salt('bf', 10)), 'user',  '+34 600 000 201',  now()),
    ('John',  'Smith',     'john@example.com',
        crypt('Password123!', gen_salt('bf', 10)), 'user',  NULL,               now());

INSERT INTO agents (first_name, last_name, title, bio, photo_url, email, phone, city_id, rating, properties_sold)
SELECT v.first_name, v.last_name, v.title,
       v.first_name || ' ' || v.last_name || ' helps buyers, sellers and renters find the right property with personalized service.',
       'https://i.pravatar.cc/300?u=' || v.email,
       v.email, v.phone, c.id, v.rating, v.sold
FROM (VALUES
    ('Jane',    'Doe',     'Senior Real Estate Advisor', 'jane.doe@urbanouse.com',     '+44 20 7946 0001', 'London',      4.9, 432),
    ('Jaydon',  'George',  'Senior Real Estate Advisor', 'jaydon.george@urbanouse.com','+1 213 555 0102',  'Los Angeles', 4.8, 310),
    ('Haylie',  'Philips', 'Real Estate Advisor',        'haylie.philips@urbanouse.com','+34 600 000 103', 'Madrid',      4.7, 268),
    ('Marilyn', 'Herwitz', 'Senior Real Estate Advisor', 'marilyn.herwitz@urbanouse.com','+1 212 555 0104','New York',    4.9, 395),
    ('Phillip', 'Bator',   'Real Estate Consultant',     'phillip.bator@urbanouse.com', '+351 910 000 105','Lisbon',      4.6, 187),
    ('Tatiana', 'Curtis',  'Luxury Property Specialist', 'tatiana.curtis@urbanouse.com','+39 320 000 0106','Roma',        4.8, 254)
) AS v(first_name, last_name, title, email, phone, city, rating, sold)
JOIN cities c ON c.name = v.city;

UPDATE agents a SET user_id = u.id
FROM users u
WHERE u.email = a.email AND u.role = 'agent';

INSERT INTO properties (
    slug, title, description, listing_type, status, property_type_id, agent_id,
    price, bedrooms, bathrooms, area_sqft, garage_spaces, year_built,
    address_line, city_id, postal_code, latitude, longitude,
    is_featured, is_popular, views_count, published_at
)
SELECT
    v.slug, v.title,
    format('A %s-bedroom %s in %s with modern finishes and plenty of natural light.',
           v.beds, lower(pt.name), c.name),
    v.listing::listing_type, 'active', pt.id, a.id,
    v.price, v.beds, v.baths, v.sqft, v.garage, v.year_built,
    v.addr, c.id, v.postal, v.lat, v.lng,
    v.featured, v.popular, v.views, now() - make_interval(days => v.days_ago)
FROM (VALUES

 ('golden-leaf-residence-manchester','Golden Leaf Residence','sale','family-house','jane.doe@urbanouse.com',      750000,3,2, 900,1,2018,'1012 Oak Avenue',  'Manchester', 'M1 1AE',    53.4808,  -2.2426,true ,false,1240, 3),
 ('oakview-residence-sydney',        'Oakview Residence',    'rent','family-house','marilyn.herwitz@urbanouse.com',600000,4,3,1800,2,2016,'4567 Lavender Way','Sydney',     'NSW 2000',  -33.8688, 151.2093,true ,false, 980, 5),
 ('golden-leaf-residence-toronto',   'Golden Leaf Residence','sale','villa',       'phillip.bator@urbanouse.com',  780000,3,2, 900,1,2020,'3456 Cedar Lane',  'Toronto',    'ON M4B 1B3', 43.6532, -79.3832,true ,false,1105, 7),
 ('skygarden-living-berlin',         'Skygarden Living',     'rent','apartment',   'tatiana.curtis@urbanouse.com', 860000,2,2,1100,0,2021,'2345 Birch Road',  'Berlin',     '10115',      52.5200,  13.4050,true ,false, 870, 9),
 ('villa-de-luna-chicago',           'Villa De Luna',        'sale','villa',       'marilyn.herwitz@urbanouse.com',500000,3,2, 900,1,2015,'789 Pine Street',  'Chicago',    'IL 60601',   41.8781, -87.6298,true ,false, 760,12),
 ('solaris-towers-new-orleans',      'Solaris Towers',       'rent','apartment',   'marilyn.herwitz@urbanouse.com',987000,1,1, 650,0,2022,'1126 Poplar Street','New Orleans','LA 70112',   29.9511, -90.0715,true ,false, 640,14),

 ('harmony-heights',      'Harmony Heights',      'sale','family-house','jaydon.george@urbanouse.com',890000,4,3,2200,2,2017,'1012 Oak Avenue','Los Angeles','CA 90001',34.0522,-118.2437,false,false,530,20),
 ('maple-springs',        'Maple Springs',        'sale','villa',       'jaydon.george@urbanouse.com',750000,3,2,1500,1,2014,'1012 Oak Avenue','Los Angeles','CA 90001',34.0610,-118.2500,false,false,410,22),
 ('the-icon-apartments',  'The Icon Apartments',  'sale','apartment',   'jaydon.george@urbanouse.com',800000,2,2,1000,1,2019,'1012 Oak Avenue','Los Angeles','CA 90001',34.0480,-118.2300,false,false,455,25),
 ('summit-grove',         'Summit Grove',         'sale','family-house','jaydon.george@urbanouse.com',900000,5,4,3000,2,2013,'1012 Oak Avenue','Los Angeles','CA 90001',34.0700,-118.2600,false,false,390,28),

 ('grand-arcadia',        'Grand Arcadia',        'sale','villa',       'jaydon.george@urbanouse.com',600000,3,2,1400,1,2012,'1012 Oak Avenue','Los Angeles','CA 90001',34.0555,-118.2410,false,true ,2100,30),
 ('horizon-breeze-villa', 'Horizon Breeze Villa', 'sale','villa',       'jaydon.george@urbanouse.com',900000,5,4,2800,2,2021,'1012 Oak Avenue','Los Angeles','CA 90001',34.0630,-118.2450,false,true ,1980,32),
 ('edenbrook-residences', 'Edenbrook Residences', 'sale','family-house','jaydon.george@urbanouse.com',400000,3,2, 900,1,2019,'1012 Oak Avenue','Los Angeles','CA 90001',34.0500,-118.2380,false,true ,2450,35),
 ('celestia-park',        'Celestia Park',        'sale','apartment',   'jaydon.george@urbanouse.com',750000,2,2,1050,1,2020,'1012 Oak Avenue','Los Angeles','CA 90001',34.0590,-118.2330,false,true ,1760,40),

 ('onyx-apartments',      'Onyx Apartments',      'sale','apartment',   'haylie.philips@urbanouse.com',750000,2,2, 950,0,2018,'Calle de Serrano 45',        'Madrid','28001',40.4250,-3.6880,false,false,330,18),
 ('tranquil-waters',      'Tranquil Waters',      'sale','villa',       'haylie.philips@urbanouse.com',500000,3,2,1300,1,2011,'Calle de Velazquez 12',      'Madrid','28006',40.4300,-3.6830,false,false,290,21),
 ('sapphire-sands-villa', 'Sapphire Sands Villa', 'sale','villa',       'haylie.philips@urbanouse.com',700000,4,3,2000,2,2016,'Paseo de la Castellana 150', 'Madrid','28046',40.4500,-3.6900,false,false,310,24),

 ('thames-view-residence','Thames View Residence','sale','family-house','jane.doe@urbanouse.com',480000,3,2,1250,1,2017,'18 Riverside Walk',  'London','SE1 9PX',51.5074,-0.1278,false,false,270,10),
 ('kensington-gardens-flat','Kensington Gardens Flat','rent','apartment','jane.doe@urbanouse.com',  3500,2,1, 800,0,2010,'77 Kensington Road','London','W8 5SA', 51.5010,-0.1900,false,false,150, 6)
) AS v(slug, title, listing, type_slug, agent_email, price, beds, baths, sqft, garage, year_built,
       addr, city, postal, lat, lng, featured, popular, views, days_ago)
JOIN property_types pt ON pt.slug = v.type_slug
JOIN cities c          ON c.name  = v.city
LEFT JOIN agents a     ON a.email = v.agent_email;

UPDATE properties
SET description = 'Modern family living in the heart of Los Angeles: 3 bedrooms, 2 bathrooms, a private pool and a one-car garage. Built in 2019 and ready to move in.'
WHERE slug = 'edenbrook-residences';

INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover)
SELECT p.id,
       format('https://picsum.photos/seed/%s-%s/1200/800', p.slug, n),
       p.title || ' - photo ' || n,
       n,
       (n = 1)
FROM properties p
CROSS JOIN generate_series(1, 5) AS n;

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id
FROM properties p
JOIN amenities a ON a.slug = 'garage'
WHERE p.garage_spaces > 0;

INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id
FROM properties p
JOIN amenities a ON a.slug = 'pool'
WHERE p.slug IN ('edenbrook-residences', 'villa-de-luna-chicago', 'harmony-heights', 'summit-grove',
                 'horizon-breeze-villa', 'sapphire-sands-villa', 'tranquil-waters',
                 'golden-leaf-residence-toronto');

INSERT INTO projects (slug, title, description, city_id, cover_url, units_available)
SELECT v.slug, v.title, v.descr, c.id,
       'https://picsum.photos/seed/' || v.slug || '/1600/900', v.units
FROM (VALUES
    ('family-living-collection', 'Family Living Collection',
     'Modern family living with spacious layouts and top-tier amenities designed for comfort and style.', 'Los Angeles', 650),
    ('madrid-skyline-residences', 'Madrid Skyline Residences',
     'Contemporary apartments and villas in the center of Madrid.', 'Madrid', 120),
    ('london-riverside', 'London Riverside',
     'Riverside homes close to the city center with excellent transport links.', 'London', 80)
) AS v(slug, title, descr, city, units)
JOIN cities c ON c.name = v.city;

UPDATE properties SET project_id = (SELECT id FROM projects WHERE slug = 'family-living-collection')
WHERE slug IN ('harmony-heights', 'maple-springs', 'the-icon-apartments', 'summit-grove',
               'grand-arcadia', 'horizon-breeze-villa', 'edenbrook-residences', 'celestia-park');

UPDATE properties SET project_id = (SELECT id FROM projects WHERE slug = 'madrid-skyline-residences')
WHERE slug IN ('onyx-apartments', 'tranquil-waters', 'sapphire-sands-villa');

UPDATE properties SET project_id = (SELECT id FROM projects WHERE slug = 'london-riverside')
WHERE slug IN ('thames-view-residence', 'kensington-gardens-flat');

INSERT INTO favorites (user_id, property_id)
SELECT u.id, p.id
FROM (VALUES
    ('anna@example.com', 'edenbrook-residences'),
    ('anna@example.com', 'harmony-heights'),
    ('anna@example.com', 'villa-de-luna-chicago'),
    ('john@example.com', 'skygarden-living-berlin'),
    ('john@example.com', 'thames-view-residence')
) AS v(email, slug)
JOIN users u      ON u.email = v.email
JOIN properties p ON p.slug  = v.slug;

INSERT INTO saved_searches (user_id, name, listing_type, city_id, property_type_id, min_bedrooms, max_price)
SELECT u.id, v.name, v.listing::listing_type, c.id, pt.id, v.beds, v.max_price
FROM (VALUES
    ('anna@example.com', 'Family house in London', 'sale', 'London', 'family-house', 3, 500000),
    ('john@example.com', 'Apartment in Berlin',    'rent', 'Berlin', 'apartment',    2, 900000)
) AS v(email, name, listing, city, type_slug, beds, max_price)
JOIN users u           ON u.email = v.email
JOIN cities c          ON c.name  = v.city
JOIN property_types pt ON pt.slug = v.type_slug;

INSERT INTO inquiries (property_id, agent_id, user_id, type, status, name, email, phone, message, preferred_at, offer_amount)
SELECT p.id, p.agent_id, u.id, v.type::inquiry_type, v.status::inquiry_status,
       v.name, v.email, v.phone, v.message, v.preferred_at, v.offer
FROM (VALUES
    ('edenbrook-residences', 'anna@example.com', 'request_showing', 'new',
     'Anna Petrova', 'anna@example.com', '+34 600 000 201',
     'I would like to see the property this weekend.', now() + interval '3 days', NULL::numeric),
    ('harmony-heights', 'john@example.com', 'offer', 'in_progress',
     'John Smith', 'john@example.com', NULL,
     'Interested in making an offer.', NULL, 870000),
    ('onyx-apartments', NULL, 'ask_question', 'new',
     'Maria Lopez', 'maria@example.com', NULL,
     'Is parking included in the price?', NULL, NULL)
) AS v(slug, user_email, type, status, name, email, phone, message, preferred_at, offer)
JOIN properties p ON p.slug = v.slug
LEFT JOIN users u ON u.email = v.user_email;

INSERT INTO contact_messages (user_id, name, email, phone, message)
SELECT u.id, v.name, v.email, v.phone, v.message
FROM (VALUES
    ('anna@example.com', 'Anna Petrova', 'anna@example.com', '+34 600 000 201', 'Do you work with international buyers?'),
    (NULL,               'Peter Novak',  'peter@example.com', NULL,              'I want to list my apartment for rent.')
) AS v(user_email, name, email, phone, message)
LEFT JOIN users u ON u.email = v.user_email;

COMMIT;

