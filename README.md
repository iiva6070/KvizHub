# KvizHub - Platforma za testiranje znanja

KvizHub je veb aplikacija za rešavanje kvizova, pregled rezultata i rangiranje korisnika.  
Aplikacija ima korisnički deo i admin panel za upravljanje kvizovima, pitanjima, kategorijama i korisnicima.

---

# Tehnologije

## Backend
- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server LocalDB
- JWT autentifikacija
- BCrypt za heširanje lozinki
- Repository + Service arhitektura

## Frontend
- React
- Vite
- React Router
- CSS
- Servisi za API pozive
- Modeli za login i registraciju

---

# Pokretanje projekta

## Backend

Backend se pokreće iz Visual Studio aplikacije.

Baza se nalazi na:

```txt
(localdb)\MSSQLLocalDB

Naziv baze:

quizdb

Backend se pokreće na:

http://localhost:5291

Swagger je dostupan na:

http://localhost:5291/swagger

Connection string u appsettings.json:

"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=quizdb;Trusted_Connection=True;MultipleActiveResultSets=true"
}

Za migracije:

dotnet ef database update
Frontend

Frontend se pokreće iz Visual Studio Code terminala.

U folderu frontenda pokrenuti:

npm install
npm run dev

Frontend se pokreće na:

http://localhost:5173

U .env fajlu treba da stoji:

VITE_BACKEND_API_URL=http://localhost:5291
Test admin nalog
Username: Iva
Email: iiva6070@gmail.com
Password: admin123
Role: Admin

Glavne funkcionalnosti Usera:
Registracija
Prijava
Pregled kvizova
Filtriranje kvizova
Rešavanje kviza
Pregled rezultata
Pregled ličnih rezultata
Rang lista
Korisnički profil

Glavne funkcionalnosti Admina:
Pregled statistike
Pregled korisnika
Kreiranje kvizova
Izmena kvizova
Brisanje kvizova
Kreiranje pitanja
Izmena pitanja
Brisanje pitanja
Pregled kategorija

Glavne rute na frontendu
/                  - Početna stranica
/login             - Prijava
/register          - Registracija
/quizzes           - Pregled kvizova
/quiz/:quizId      - Rešavanje kviza
/my-results        - Moji rezultati
/my-results/:id    - Detalji rezultata
/leaderboard       - Rang lista
/profile           - Moj profil
/admin             - Admin panel

Glavni API endpoint-i
Auth
POST /api/Auth/login
POST /api/Auth/register
POST /api/Auth/refresh
POST /api/Auth/validate
Quiz
GET /api/Quiz
GET /api/Quiz/{id}
GET /api/Quiz/{id}/questions
Admin
GET    /api/Admin/stats
GET    /api/Admin/users
GET    /api/Admin/questions
GET    /api/Admin/quizzes
POST   /api/Admin/quizzes
GET    /api/Admin/quizzes/{id}
PUT    /api/Admin/quizzes/{id}
DELETE /api/Admin/quizzes/{id}
GET    /api/Admin/quizzes/{quizId}/questions
POST   /api/Admin/quizzes/{quizId}/questions
GET    /api/Admin/categories

Bezbednost
JWT autentifikacija
Role-based autorizacija
BCrypt hash lozinki
Zaštićeni admin endpoint-i
SQL Server baza sa Entity Framework Core ORM-om