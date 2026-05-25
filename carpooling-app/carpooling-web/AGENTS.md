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
- Auth: JWT tokens + bcrypt
- Database: Neon DB + Drizzle ORM

# User Interface Guidelines
- Implement modern UI, responsive design, use server-rendered components in Next.js 
- Use server-side rendering, only use client components for browser interaction and forms