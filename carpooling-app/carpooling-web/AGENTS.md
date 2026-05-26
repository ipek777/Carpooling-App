<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


# CarpoolGo: Carpooling Next.js App
- CarpoolGo app: organize and take part in carpools (drivers create carpooling listings, passengers view listings and join carpools)

# Technologies
- Next.js + Neon DB + Drizzle ORM + Tailwind

# Architectural Guidelines
- Service layer: implement app business logic, used by the RESTful API and Server Actions
- Use modular design: split the app into self-contained components, to avoid long complex files with too much code
- Pagination: ALWAYS implement server-side data paging for data retrieval (e.g., searching for trips) to maintain performance under heavy load
- Auth: JWT tokens + bcrypt. Enforce access control in ALL API endpoints and Server Actions. Verify the JWT token before performing any database read/write operations.
- Database: Neon DB + Drizzle ORM. ALWAYS use Drizzle migrations to make changes to the DB schema. The database must be designed to handle 10,000+ records. ALWAYS implement database indexes on frequently queried columns (e.g., origin, destination, departure time). Bookings must track specific seats (e.g., "front_passenger", "back_left"). Use unique indexes to prevent double-booking the same seat on the same trip unless the previous booking is canceled.

# User Interface Guidelines
- Implement modern UI, responsive design, use server-rendered components in Next.js 
- Use server-side rendering, only use client components when interactivity (hooks, state) is explicitly required

