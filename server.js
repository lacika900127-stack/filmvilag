const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const { Pool } = require('pg');
const slug = require('slug');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5000',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'filmvilag-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'filmvilag'
});

// Test DB connection
pool.on('error', (err) => {
    console.error('Adatbázis hiba:', err);
});

// ==================== ADMIN LOGIN ====================
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'laszlo123';

    if (password === adminPassword) {
        req.session.adminLoggedIn = true;
        return res.json({ success: true, message: 'Bejelentkezés sikeres!' });
    }

    res.status(401).json({ success: false, message: 'Hibás jelszó!' });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Kijelentkezési hiba' });
        }
        res.json({ success: true, message: 'Kijelentkezés sikeres!' });
    });
});

app.get('/api/admin/check-session', (req, res) => {
    res.json({ loggedIn: req.session.adminLoggedIn || false });
});

// Middleware: Admin védelem
const adminAuth = (req, res, next) => {
    if (!req.session.adminLoggedIn) {
        return res.status(403).json({ success: false, message: 'Nincs jogosultság!' });
    }
    next();
};

// ==================== FILMEK API ====================

// GET - Összes film vagy kategória alapján
app.get('/api/films', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT f.*, s.meta_title, s.meta_description, s.keywords, s.url_slug FROM films f LEFT JOIN seo_data s ON f.id = s.film_id ORDER BY f.created_at DESC LIMIT 100';
        let params = [];

        if (category && category !== 'all') {
            query = 'SELECT f.*, s.meta_title, s.meta_description, s.keywords, s.url_slug FROM films f LEFT JOIN seo_data s ON f.id = s.film_id WHERE f.category = $1 ORDER BY f.created_at DESC LIMIT 100';
            params = [category];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Adatbázis hiba', details: err.message });
    }
});

// GET - Banner filmek (utolsó 5)
app.get('/api/films/banner', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, poster_emoji, category FROM films ORDER BY created_at DESC LIMIT 5'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Adatbázis hiba' });
    }
});

// GET - Egy film részletei ID alapján
app.get('/api/films/:filmId', async (req, res) => {
    try {
        const { filmId } = req.params;

        if (!filmId || isNaN(filmId)) {
            return res.status(400).json({ error: 'Érvénytelen film ID' });
        }

        const filmResult = await pool.query(
            'SELECT f.*, s.* FROM films f LEFT JOIN seo_data s ON f.id = s.film_id WHERE f.id = $1',
            [parseInt(filmId)]
        );

        if (filmResult.rows.length === 0) {
            return res.status(404).json({ error: 'Film nem található' });
        }

        const film = filmResult.rows[0];

        // Views száma növelése
        await pool.query('UPDATE films SET views = views + 1 WHERE id = $1', [filmId]);

        // Hozzászólások
        const commentsResult = await pool.query(
            'SELECT id, user_name, comment_text, likes, created_at FROM comments WHERE film_id = $1 ORDER BY created_at DESC',
            [filmId]
        );

        // Lájkok
        const likesResult = await pool.query(
            'SELECT COUNT(*)::int as total_likes FROM likes WHERE film_id = $1',
            [filmId]
        );

        res.json({
            film,
            comments: commentsResult.rows,
            totalLikes: likesResult.rows[0].total_likes || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Adatbázis hiba', details: err.message });
    }
});

// POST - Új film (ADMIN)
app.post('/api/admin/films', adminAuth, async (req, res) => {
    try {
        const { title, category, video_link, poster_emoji, description, year, director, duration, rating } = req.body;
        const { meta_title, meta_description, keywords, h1_tag, og_title, og_description } = req.body;

        if (!title || !category || !video_link || !description) {
            return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
        }

        // Film hozzáadása
        const filmResult = await pool.query(
            'INSERT INTO films (title, category, video_link, poster_emoji, description, year, director, duration, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [title, category, video_link, poster_emoji || '🎬', description, year || null, director || null, duration || null, rating || 8.0]
        );

        const filmId = filmResult.rows[0].id;
        const urlSlug = slug(title, { lower: true });

        // SEO adatok
        await pool.query(
            'INSERT INTO seo_data (film_id, meta_title, meta_description, keywords, url_slug, h1_tag, og_title, og_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [filmId, meta_title || title, meta_description || description.substring(0, 160), keywords || '', urlSlug, h1_tag || title, og_title || title, og_description || description.substring(0, 160)]
        );

        res.json({ success: true, filmId, message: 'Film sikeresen hozzáadva!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a film hozzáadásakor', details: err.message });
    }
});

// PUT - Film szerkesztése (ADMIN)
app.put('/api/admin/films/:filmId', adminAuth, async (req, res) => {
    try {
        const { filmId } = req.params;
        const { title, category, video_link, description, year, director, duration, rating } = req.body;
        const { meta_title, meta_description, keywords, h1_tag, og_title, og_description } = req.body;

        if (!filmId || isNaN(filmId)) {
            return res.status(400).json({ error: 'Érvénytelen film ID' });
        }

        // Film frissítése
        await pool.query(
            'UPDATE films SET title = $1, category = $2, video_link = $3, description = $4, year = $5, director = $6, duration = $7, rating = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9',
            [title, category, video_link, description, year || null, director || null, duration || null, rating || 8.0, parseInt(filmId)]
        );

        // SEO frissítése
        const urlSlug = slug(title, { lower: true });
        await pool.query(
            'UPDATE seo_data SET meta_title = $1, meta_description = $2, keywords = $3, url_slug = $4, h1_tag = $5, og_title = $6, og_description = $7, updated_at = CURRENT_TIMESTAMP WHERE film_id = $8',
            [meta_title || title, meta_description || description.substring(0, 160), keywords || '', urlSlug, h1_tag || title, og_title || title, og_description || description.substring(0, 160), parseInt(filmId)]
        );

        res.json({ success: true, message: 'Film sikeresen frissítve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a film szerkesztésekor', details: err.message });
    }
});

// DELETE - Film törlése (ADMIN)
app.delete('/api/admin/films/:filmId', adminAuth, async (req, res) => {
    try {
        const { filmId } = req.params;
        
        if (!filmId || isNaN(filmId)) {
            return res.status(400).json({ error: 'Érvénytelen film ID' });
        }

        await pool.query('DELETE FROM films WHERE id = $1', [parseInt(filmId)]);
        res.json({ success: true, message: 'Film sikeresen törölve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a film törlésekor', details: err.message });
    }
});

// ==================== HOZZÁSZÓLÁSOK ====================

app.post('/api/comments', async (req, res) => {
    try {
        const { film_id, user_name, comment_text } = req.body;

        if (!film_id || !user_name || !comment_text) {
            return res.status(400).json({ error: 'Hiányzó adatok' });
        }

        const result = await pool.query(
            'INSERT INTO comments (film_id, user_name, comment_text) VALUES ($1, $2, $3) RETURNING *',
            [film_id, user_name.substring(0, 100), comment_text.substring(0, 1000)]
        );

        res.json({ success: true, comment: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a hozzászólás hozzáadásakor', details: err.message });
    }
});

// ==================== LÁJKOK ====================

app.post('/api/likes', async (req, res) => {
    try {
        const { film_id } = req.body;
        const userIp = req.ip || req.connection.remoteAddress || '0.0.0.0';

        if (!film_id) {
            return res.status(400).json({ error: 'Film ID hiányzik' });
        }

        // Ellenőrzés
        const existingLike = await pool.query(
            'SELECT id FROM likes WHERE film_id = $1 AND user_ip = $2',
            [film_id, userIp]
        );

        if (existingLike.rows.length > 0) {
            return res.status(400).json({ error: 'Már lájkoltál ezt a filmet!' });
        }

        await pool.query(
            'INSERT INTO likes (film_id, user_ip) VALUES ($1, $2)',
            [film_id, userIp]
        );

        const likesResult = await pool.query(
            'SELECT COUNT(*)::int as total_likes FROM likes WHERE film_id = $1',
            [film_id]
        );

        res.json({ success: true, totalLikes: likesResult.rows[0].total_likes || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a lájk hozzáadásakor', details: err.message });
    }
});

// ==================== KATEGÓRIÁK ====================

app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT category FROM films WHERE category IS NOT NULL ORDER BY category');
        res.json(result.rows.map(row => row.category));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Adatbázis hiba' });
    }
});

// ==================== SITE SETTINGS ====================

app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM site_settings LIMIT 1');
        if (result.rows.length === 0) {
            await pool.query(
                'INSERT INTO site_settings (site_title, primary_color, secondary_color, bg_color) VALUES ($1, $2, $3, $4)',
                ['FilmVilág', '#e94560', '#ff6b6b', '#1a1a2e']
            );
            const newResult = await pool.query('SELECT * FROM site_settings LIMIT 1');
            return res.json(newResult.rows[0]);
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Adatbázis hiba', details: err.message });
    }
});

app.put('/api/admin/settings', adminAuth, async (req, res) => {
    try {
        const { site_title, site_description, primary_color, secondary_color, bg_color, font_family, ad_positions } = req.body;

        await pool.query(
            'UPDATE site_settings SET site_title = $1, site_description = $2, primary_color = $3, secondary_color = $4, bg_color = $5, font_family = $6, ad_positions = $7, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
            [site_title || 'FilmVilág', site_description || '', primary_color || '#e94560', secondary_color || '#ff6b6b', bg_color || '#1a1a2e', font_family || 'Segoe UI', JSON.stringify(ad_positions || {})]
        );

        res.json({ success: true, message: 'Beállítások frissítve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a beállítások frissítésekor', details: err.message });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', server: 'FilmVilág' });
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
    res.status(404).json({ error: 'Nem található' });
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error('Szerver hiba:', err);
    res.status(500).json({ error: 'Szerver hiba', details: err.message });
});

// ==================== SERVER INDÍTÁS ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ FilmVilág server fut: http://localhost:${PORT}`);
    console.log(`📊 Admin jelszó: ${process.env.ADMIN_PASSWORD || 'laszlo123'}`);
});
