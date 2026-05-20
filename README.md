# Nauči Matematiku — Platforma za Video Kurseve

## 🚀 Pokretanje aplikacije

### 1. Instalirajte zavisnosti
```bash
npm install
```

### 2. Inicijalizujte bazu podataka
```bash
npm run db:setup
```
Ovo kreira SQLite bazu i dodaje demo podatke (kurseve, videa i naloge).

### 3. Pokrenite razvojni server
```bash
npm run dev
```

Otvorite [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo nalozi

| Email | Lozinka | Uloga |
|-------|---------|-------|
| admin@naucikurs.com | admin123 | Administrator |
| student@naucimatematiku.rs | student123 | Student |

---

## 🗄️ Baza podataka

Aplikacija koristi **SQLite** bazu podataka (putem **Prisma** ORM) koja se kreira u `prisma/videokurs.db`.

> **Zašto Prisma?** Za razliku od `better-sqlite3`, Prisma ne zahteva kompajliranje C++ koda ni Visual Studio — radi na svim platformama odmah po instalaciji.

### Dodavanje novih naloga

Koristite Prisma Studio (vizuelni editor baze):
```bash
npx prisma studio
```
Ili direktno kroz seed skriptu — izmenite `prisma/seed.js` i dodajte nov nalog u `data` niz.

### Dodavanje kurseva i videa

Izmenite `prisma/seed.js` → dodajte objekat u `coursesData` niz, a u njega ugradite `videos` array.

Nakon izmene ponovo pokrenite:
```bash
node prisma/seed.js
```

---

## 📁 Struktura projekta

```
videokurs/
├── prisma/
│   ├── schema.prisma        # Shema baze
│   ├── seed.js              # Inicijalni podaci
│   └── videokurs.db         # SQLite fajl (auto-kreira se)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth rute
│   │   │   ├── courses/             # API za kurseve
│   │   │   └── videos/              # API za videa
│   │   ├── dashboard/               # Dashboard stranica
│   │   ├── login/                   # Login stranica
│   │   └── layout.tsx
│   └── lib/
│       ├── db.ts                    # Prisma klijent
│       └── auth.ts                  # NextAuth konfiguracija
└── .env.local                       # Environment varijable
```

---

## ⚙️ Produkcijsko pokretanje

```bash
npm run build
npm start
```

Za produkciju, promenite `NEXTAUTH_SECRET` u `.env.local` na nasumičnu vrednost!

