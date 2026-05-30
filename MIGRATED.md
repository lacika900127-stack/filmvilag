# FilmVilág - Film Streaming Platform

**TELJES ÚJRAÉPÍTÉSRE INDÍTOTT VERZIÓ**

Módosítások:
1. ❌ Régi index.html és movies.json ELTÁVOLÍTVA
2. ✅ Új index.html a public/ mappában
3. ✅ Film.html a public/ mappában
4. ✅ Server.js - Node.js backend PostgreSQL-lel
5. ✅ Database schema - Teljes adatbázis
6. ✅ Admin panel - Filmek kezelése

## Telepítés

```bash
git clone https://github.com/lacika900127-stack/filmvilag.git
cd filmvilag
npm install
createdb filmvilag
psql filmvilag < database/schema.sql
cp .env.example .env
# Szerkeszd: DB_PASSWORD
npm start
```

Böngésző: `http://localhost:5000`
Admin: Jelszó = `laszlo123`
