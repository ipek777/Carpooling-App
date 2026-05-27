# CarpoolGo: Carpooling App

CarpoolGo is a carpooling platform for organizing shared rides. It helps drivers publish trips with available seats, and helps passengers search for upcoming rides, book a specific seat, leave a trip, comment on active trips, and review completed trips.

The repository is an npm workspace with two applications:

- `carpooling-web`: Next.js web application, API backend, database access, authentication, and primary user interface.
- `carpooling-mobile`: Expo mobile application for the main on-the-go passenger and driver flows.

## Project Description

CarpoolGo supports these main user journeys:

- Visitors can view the public web pages and register for an account.
- Registered users can log in, manage their profile, search trips, view trip details, and see their own trips.
- Drivers can create trips, edit the departure time of upcoming trips, cancel their own trips, view passengers, and comment on trips they drive.
- Passengers can join upcoming trips by selecting an available seat, leave trips before departure, comment on trips they joined, and review past trips.

The web app is the full application surface. The mobile app is a focused client for login, profile/trip browsing, searching, booking, leaving, canceling, and viewing trip details.

## Architecture

```mermaid
flowchart LR
  UserWeb[Web user] --> NextUI[Next.js App Router pages]
  UserMobile[Mobile user] --> Expo[Expo Router app]
  NextUI --> ServerActions[Next.js server actions]
  NextUI --> ApiRoutes[Next.js API routes]
  Expo -->|HTTP + Bearer JWT| ApiRoutes
  ServerActions --> Services[Service layer]
  ApiRoutes --> ApiAuth[API auth helper]
  ApiAuth --> JWT[JWT verification]
  ApiRoutes --> Services
  Services --> Drizzle[Drizzle ORM]
  Drizzle --> Neon[(PostgreSQL / Neon)]
  ServerActions --> CookieAuth[HTTP-only session cookie]
  CookieAuth --> JWT
```

### Front End

- **Web:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS.
- **Mobile:** Expo 56, Expo Router, React Native 0.85, React 19, TypeScript.
- **Shared behavior:** both clients use the same API/backend data model. The mobile app calls `/api/...` endpoints through `EXPO_PUBLIC_API_BASE_URL`.

### Back End

The backend lives inside `carpooling-web` as Next.js route handlers and server actions.

- Server-rendered web pages call server actions and service functions directly.
- Mobile and API clients call Next.js API routes under `carpooling-web/src/app/api`.
- Authentication uses JWTs signed with `JWT_SECRET`.
- The web app stores the JWT in an HTTP-only `carpoolgo_session` cookie.
- API requests can authenticate with either `Authorization: Bearer <token>` or the web session cookie.

### Database

- PostgreSQL database, configured through `DATABASE_URL`.
- Drizzle ORM schema is defined in `carpooling-web/src/db/drizzle.schema.ts`.
- Drizzle migrations are stored in `carpooling-web/drizzle/migrations`.
- The project uses `@neondatabase/serverless`, so Neon is the intended hosted Postgres provider.

### Main API Routes

All routes are under `/api`.

| Method | Route | Purpose | Auth |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Log in and receive a JWT token | No |
| `GET` | `/trips` | Search upcoming open trips with pagination and filters | Yes |
| `POST` | `/trips` | Create a new trip | Yes |
| `GET` | `/trips/:id` | Get trip details, passengers, comments, reviews, and user-specific flags | Yes |
| `PATCH` | `/trips/:id` | Update departure time for a driver's upcoming trip | Yes |
| `POST` | `/trips/:id/join` | Join a trip and reserve a seat | Yes |
| `POST` | `/trips/:id/leave` | Leave an upcoming trip | Yes |
| `POST` | `/trips/:id/cancel` | Cancel a trip as the driver | Yes |
| `POST` | `/trips/:id/comments` | Add a comment as the driver or a passenger | Yes |
| `POST` | `/trips/:id/reviews` | Review a past trip as a confirmed passenger | Yes |
| `GET` | `/user/profile` | Get current user's profile | Yes |
| `PATCH` | `/user/profile` | Update current user's name/photo URL | Yes |
| `GET` | `/user/trips` | Get current user's upcoming or past trips | Yes |
| `GET` | `/users/:id` | Get a public user profile | Yes |
| `GET` | `/docs` | API documentation endpoint | No |

## Database Schema Design

```mermaid
erDiagram
  users ||--o{ trips : drives
  users ||--o{ trip_bookings : books
  users ||--o{ trip_comments : writes
  users ||--o{ trip_reviews : reviews
  trips ||--o{ trip_bookings : has
  trips ||--o{ trip_comments : has
  trips ||--o{ trip_reviews : has

  users {
    serial id PK
    varchar email UK
    text password_hash
    varchar name
    text photo_url
    timestamp created_at
    timestamp updated_at
  }

  trips {
    serial id PK
    integer driver_id FK
    varchar origin
    varchar destination
    date date
    time departure_time
    numeric price_per_seat
    integer capacity
    boolean canceled
    timestamp created_at
    timestamp updated_at
  }

  trip_bookings {
    serial id PK
    integer trip_id FK
    integer passenger_id FK
    seat_position seat_position
    booking_status status
    timestamp created_at
    timestamp updated_at
  }

  trip_comments {
    serial id PK
    integer trip_id FK
    integer user_id FK
    timestamp comment_date
    text text
  }

  trip_reviews {
    serial id PK
    integer trip_id FK
    integer reviewer_id FK
    timestamp review_date
    integer rating
    text text
  }
```

### Schema Notes

- `users.email` is unique.
- `trips.driver_id` references `users.id`.
- `trip_bookings.trip_id` and `trip_bookings.passenger_id` reference `trips.id` and `users.id`.
- Active bookings use `booking_status`: `pending`, `confirmed`, or `canceled`.
- Seats use `seat_position`: `front`, `back_left`, `back_middle`, or `back_right`.
- A partial unique index prevents two non-canceled bookings from using the same seat on the same trip.
- Reviews are unique per `(trip_id, reviewer_id)`.
- Foreign keys cascade on delete, so removing a user or trip removes dependent trips/bookings/comments/reviews.

## Repository Structure

```text
.
|-- README.md
|-- AGENTS.md
|-- package.json
|-- package-lock.json
|-- postman/
|   |-- collections/
|   `-- environments/
|-- carpooling-web/
|   |-- package.json
|   |-- next.config.ts
|   |-- middleware.ts
|   |-- drizzle/
|   |   `-- migrations/
|   |-- src/
|   |   |-- app/
|   |   |   |-- api/
|   |   |   |-- dashboard/
|   |   |   |-- profile/
|   |   |   |-- trips/
|   |   |   |-- users/
|   |   |   `-- (auth)/
|   |   |-- components/
|   |   |-- db/
|   |   |   |-- drizzle.schema.ts
|   |   |   |-- drizzle.config.mjs
|   |   |   `-- seed.ts
|   |   `-- lib/
|   |       |-- auth.ts
|   |       |-- apiAuth.ts
|   |       |-- db.ts
|   |       |-- jwt.ts
|   |       `-- services/
|   `-- public/
`-- carpooling-mobile/
    |-- package.json
    |-- app.json
    |-- src/
    |   |-- app/
    |   |-- lib/
    |   |   |-- auth.tsx
    |   |   `-- config.ts
    |   `-- app/MobileNav.tsx
    |-- assets/
    `-- scripts/
```

### Key Files

- `package.json`: root npm workspace scripts for running web and mobile apps together.
- `carpooling-web/src/app/api`: backend API route handlers.
- `carpooling-web/src/app`: Next.js pages and layouts.
- `carpooling-web/src/components`: reusable web UI components such as headers, trip cards, forms, and trip actions.
- `carpooling-web/src/lib/services`: business logic for trips and users.
- `carpooling-web/src/lib/auth.ts`: web session actions for registration, login, logout, and current user lookup.
- `carpooling-web/src/lib/apiAuth.ts`: API authentication from bearer tokens or cookies.
- `carpooling-web/src/lib/jwt.ts`: JWT creation and verification.
- `carpooling-web/src/lib/db.ts`: Drizzle database client.
- `carpooling-web/src/db/drizzle.schema.ts`: source of truth for the database schema.
- `carpooling-web/src/db/seed.ts`: database seed script.
- `carpooling-mobile/src/app`: Expo Router screens.
- `carpooling-mobile/src/lib/auth.tsx`: mobile authentication context.
- `carpooling-mobile/src/lib/config.ts`: mobile API base URL configuration.
- `postman`: Postman collections and environment files for API testing.

## Local Development Setup

### Prerequisites

- Node.js and npm.
- A PostgreSQL database. Neon is recommended because the web app uses `@neondatabase/serverless`.
- Expo tooling through `npx expo` or the npm scripts.
- Android Studio, Xcode, or Expo Go if you want to run the mobile app on a device or simulator.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Carpooling-App
```

### 2. Install Dependencies

Install dependencies for the root workspace and both apps:

```bash
npm install
```

### 3. Configure Environment Variables

Create `carpooling-web/.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
```

For the mobile app, set the API URL when the API is not reachable at `http://localhost:3000/api`.

Create `carpooling-mobile/.env` if needed:

```bash
EXPO_PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

For a physical phone, `localhost` means the phone itself. Use your computer's LAN IP instead, for example:

```bash
EXPO_PUBLIC_API_BASE_URL="http://192.168.1.20:3000/api"
```

### 4. Prepare the Database

Run migrations:

```bash
npm -w carpooling-web run db:migrate
```

Optionally seed sample data:

```bash
npm -w carpooling-web run db:seed
```

### 5. Run the Web App and API

```bash
npm run web
```

Open:

```text
http://localhost:3000
```

The API is available at:

```text
http://localhost:3000/api
```

### 6. Run the Mobile App

In a separate terminal:

```bash
npm run mobile
```

Then use the Expo terminal menu to open the app in Expo Go, Android, iOS, or web.

### 7. Run Both Apps Together

From the repository root:

```bash
npm run dev
```

This starts the Next.js app/API and the Expo app concurrently.

## Useful Scripts

### Root

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run web/API and mobile together |
| `npm run web` | Run only the Next.js web app and API |
| `npm run mobile` | Run only the Expo mobile app |
| `npm run build` | Build all workspaces |
| `npm run lint` | Run lint scripts where available |

### Web Workspace

| Script | Purpose |
| --- | --- |
| `npm -w carpooling-web run dev` | Start Next.js development server |
| `npm -w carpooling-web run build` | Build the web app |
| `npm -w carpooling-web run start` | Start the production web build |
| `npm -w carpooling-web run lint` | Run ESLint |
| `npm -w carpooling-web run db:generate` | Generate Drizzle migrations |
| `npm -w carpooling-web run db:migrate` | Apply Drizzle migrations |
| `npm -w carpooling-web run db:seed` | Seed the database |

### Mobile Workspace

| Script | Purpose |
| --- | --- |
| `npm -w carpooling-mobile run dev` | Start Expo |
| `npm -w carpooling-mobile run android` | Start Expo for Android |
| `npm -w carpooling-mobile run ios` | Start Expo for iOS |
| `npm -w carpooling-mobile run web` | Start Expo web |
| `npm -w carpooling-mobile run build` | Export the Expo app |

## Development Notes

- The web app must be running for the mobile app to use the API locally.
- Most protected API endpoints require `Authorization: Bearer <token>`.
- Web pages authenticate through the `carpoolgo_session` HTTP-only cookie.
- Trip state is computed from `date + departure_time`; trips become past after their departure time.
- Canceled trips remain visible as canceled/past records.
- Capacity is limited to 1-4 seats, matching the four supported seat positions.
