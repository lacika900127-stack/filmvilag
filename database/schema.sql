-- Films Table
CREATE TABLE films (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    video_link VARCHAR(500) NOT NULL,
    poster_emoji VARCHAR(10),
    description TEXT,
    year INTEGER,
    director VARCHAR(255),
    duration VARCHAR(50),
    rating DECIMAL(3,1),
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEO Table
CREATE TABLE seo_data (
    id SERIAL PRIMARY KEY,
    film_id INTEGER NOT NULL UNIQUE,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    keywords VARCHAR(500),
    url_slug VARCHAR(255) UNIQUE,
    h1_tag VARCHAR(255),
    og_title VARCHAR(255),
    og_description VARCHAR(255),
    og_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

-- Comments Table
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    film_id INTEGER NOT NULL,
    user_name VARCHAR(100),
    comment_text TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

-- Likes Table
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    film_id INTEGER NOT NULL,
    user_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(film_id, user_ip),
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Site Settings Table
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    site_title VARCHAR(255) DEFAULT 'FilmVilág',
    site_description TEXT,
    primary_color VARCHAR(7) DEFAULT '#e94560',
    secondary_color VARCHAR(7) DEFAULT '#ff6b6b',
    bg_color VARCHAR(7) DEFAULT '#1a1a2e',
    font_family VARCHAR(100) DEFAULT 'Segoe UI',
    ad_positions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad Blocks Table
CREATE TABLE ad_blocks (
    id SERIAL PRIMARY KEY,
    position VARCHAR(50),
    size VARCHAR(20),
    code TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_films_category ON films(category);
CREATE INDEX idx_films_created_at ON films(created_at);
CREATE INDEX idx_seo_slug ON seo_data(url_slug);
CREATE INDEX idx_comments_film_id ON comments(film_id);
CREATE INDEX idx_likes_film_id ON likes(film_id);
