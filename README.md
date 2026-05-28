# 🎬 FilmVilág - Film Streaming Platform

Egy modern, SEO-optimalizált filmmegosztó weboldal Node.js, Express és PostgreSQL-vel készítve.

## ✨ Funkciók

### 👥 Felhasználó Oldalak
- ✅ **Netflix-stílusú felület** - Modern, reszponzív design
- ✅ **Banner szekció** - 5 film automatikus váltása 4 másodpercenként
- ✅ **Filmkereső** - Valós idejű keresés cím és kategória szerint
- ✅ **Kategóriaszűrés** - Filmek szűrése kategóriák alapján
- ✅ **Film részlet oldal** - Videólejátszó, leírás, hozzászólások, lájkok
- ✅ **Hozzászólási rendszer** - Felhasználók által írt vélemények
- ✅ **Lájk funkcionalitás** - IP-cím alapú duplikátum-megakadályozás

### 🔐 Admin Panel
- ✅ **Jelszó védelem** - Biztonságos admin bejelentkezés
- ✅ **Filmek kezelése** - Filmek hozzáadása, szerkesztése, törlése
- ✅ **SEO beállítások** - Meta tagek, keywords, Open Graph adatok
- ✅ **Weboldal testreszabás** - Szín, cím, leírás módosítása
- ✅ **Reklám helyek** - Ad blokkok pozícionálása és méretezése

### 🔍 SEO Optimalizáció
- ✅ **Meta tagek** - Title, Description, Keywords, Robots
- ✅ **Open Graph** - Facebook/Twitter megosztások
- ✅ **Schema.org Markup** - JSON-LD Movie típus
- ✅ **Canonical URL** - Duplikált tartalom elkerülése
- ✅ **Sitemap & Robots.txt** - Keresőmotorok indexeléshez
- ✅ **H1-H3 tagek** - Hierarchikus címek
- ✅ **Belső linkelés** - Kapcsolódó filmekhez
- ✅ **Image Alt Text** - Képek leírása

## 🚀 Telepítés

### Előfeltételek
- Node.js (v14+)
- PostgreSQL (v12+)
- npm vagy yarn

### 1. Repo klónozása
```bash
git clone https://github.com/lacika900127-stack/filmvilag.git
cd filmvilag
```

### 2. Függőségek telepítése
```bash
npm install
```

### 3. Adatbázis beállítása
```bash
# PostgreSQL-ben új adatbázis létrehozása
createdb filmvilag

# Schema betöltése
psql filmvilag < database/schema.sql
```

### 4. .env fájl beállítása
```bash
cp .env.example .env
# Szerkeszd a .env fájlt a saját adataiddal
```

### 5. Server indítása
```bash
npm start
```

Server fut: `http://localhost:5000`

## 📋 Admin Jelszó

**Jelszó:** `laszlo123`

Ezt az admin panelen a 🔐 Admin gombra kattintva tudod használni.

## 📁 Mappa Szerkezet

```
filmvilag/
├── server.js              # Backend szerver
├── package.json           # Függőségek
├── .env                   # Környezeti változók
├── database/
│   └── schema.sql         # Adatbázis séma
└── public/
    ├── index.html         # Főoldal
    └── film.html          # Film részlet oldal
```

## 🎯 API Végpontok

### Filmek
- `GET /api/films` - Összes film lekérdezése
- `GET /api/films/banner` - Banner filmek (5 db)
- `GET /api/films/:filmId` - Egy film részletei
- `POST /api/admin/films` - Új film hozzáadása (ADMIN)
- `PUT /api/admin/films/:filmId` - Film szerkesztése (ADMIN)
- `DELETE /api/admin/films/:filmId` - Film törlése (ADMIN)

### Kategóriák
- `GET /api/categories` - Összes kategória

### Hozzászólások
- `POST /api/comments` - Hozzászólás hozzáadása

### Lájkok
- `POST /api/likes` - Lájk hozzáadása

### Beállítások
- `GET /api/settings` - Weboldal beállítások
- `PUT /api/admin/settings` - Beállítások módosítása (ADMIN)

### Admin
- `POST /api/admin/login` - Bejelentkezés
- `POST /api/admin/logout` - Kijelentkezés
- `GET /api/admin/check-session` - Session ellenőrzése

## 📊 Adatbázis Táblák

- `films` - Filmek alapadatai
- `seo_data` - SEO információk
- `comments` - Hozzászólások
- `likes` - Lájkok
- `categories` - Kategóriák
- `site_settings` - Weboldal beállítások
- `ad_blocks` - Reklám blokkok

## 🎨 Testreszabás

### Szín módosítása
Admin panelen: Beállítások → Szín választása

### Weboldal cím megváltoztatása
Admin panelen: Beállítások → Weboldal Címe

### Film hozzáadása
Admin panelen: Filmek → Új Film Hozzáadása
- Töltsd ki az összes kötelező mezőt (*)
- Adj meg SEO információkat (magasabb rangszorozás)
- Kattints "Film Hozzáadása"

## 🔒 Biztonsági Megjegyzések

1. **Jelszó**: Ezt az `.env` fájlban tárolod
2. **HTTPS**: Production-ban HTTPS-t használj
3. **CORS**: API csak az oldal domainjéről hívható
4. **SQL Injection**: Paraméteres queryek használata

## 📈 SEO Javaslatok

1. **Film leírása**: Minimum 200 szó, természetes kulcsszavakkal
2. **Meta Title**: 50-60 karakter, fő keyword az elején
3. **Meta Description**: 155-160 karakter, vonzó
4. **Keywords**: 3-5 fő keyword + long-tail variációk
5. **Friss tartalom**: Új filmek rendszeres hozzáadása
6. **Belső linkek**: Kapcsolódó filmekhez linkek
7. **Sitemap**: Automatikus generálás új filmek után
8. **Backlinks**: Más oldalakról hivatkozások

## 💰 Pénzkeresési Lehetőségek

1. **Google AdSense** - Kontextus-alapú hirdetések
2. **Affiláció** - Premium linkekből komisszió
3. **Sponsorlás** - Filmstúdiók fizetnek kiemelt helyzetért
4. **Premium tartalom** - VIP felhasználók

## 🐛 Hibaelhárítás

### Database hibák
```bash
# Újra létrehozni az adatbázist
dropdb filmvilag
createdb filmvilag
psql filmvilag < database/schema.sql
```

### Port már használatban van
```bash
# Port módosítása .env-ben
PORT=3000
```

### Module hibák
```bash
# Tiszta telepítés
rm -rf node_modules package-lock.json
npm install
```

## 📞 Támogatás

Problémák esetén nyiss egy Issue-t a GitHub repón!

## 📄 Licenc

MIT License - Szabad felhasználás és módosítás

---

**Készítette:** FilmVilág Team
**Frissítve:** 2026
