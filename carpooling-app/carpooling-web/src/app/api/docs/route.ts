const docsHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CarpoolGo API Documentation</title>
    <style>
      body { font-family: system-ui, sans-serif; line-height: 1.6; margin: 0; padding: 32px; background: #f7fafc; color: #0f172a; }
      h1, h2 { margin-top: 1.5rem; }
      pre { background: #111827; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
      code { background: rgba(15,23,42,.06); padding: 2px 6px; border-radius: 4px; }
      .endpoint { margin-bottom: 1.5rem; }
    </style>
  </head>
  <body>
    <h1>CarpoolGo API Documentation</h1>
    <p>Minimal REST API for mobile clients.</p>

    <div class="endpoint">
      <h2>POST /api/auth/login</h2>
      <p>Login with email and password, returns a JWT token.</p>
      <pre>{ "email": "user@example.com", "password": "secret" }</pre>
      <p>Response:</p>
      <pre>{ "token": "..." }</pre>
    </div>

    <div class="endpoint">
      <h2>GET /api/trips</h2>
      <p>List active trips open for joining. Requires <code>Authorization: Bearer &lt;token&gt;</code>.</p>
      <pre>?page=1&limit=10</pre>
    </div>

    <div class="endpoint">
      <h2>GET /api/user/profile</h2>
      <p>Get the authenticated user's profile.</p>
    </div>

    <div class="endpoint">
      <h2>PATCH /api/user/profile</h2>
      <p>Update the authenticated user's name and profile photo URL.</p>
      <pre>{ "name": "Lora Smith", "photoUrl": "https://example.com/photo.jpg" }</pre>
      <p>Response:</p>
      <pre>{ "success": true }</pre>
    </div>

    <div class="endpoint">
      <h2>POST /api/trips</h2>
      <p>Create a new trip as the authenticated driver.</p>
      <pre>{
  "origin": "Sofia",
  "destination": "Plovdiv",
  "date": "2026-06-10",
  "departureTime": "09:30",
  "capacity": 4,
  "pricePerSeat": 12.50
}</pre>
      <p>Response:</p>
      <pre>{ "id": 123 }</pre>
    </div>

    <div class="endpoint">
      <h2>GET /api/trips/[id]</h2>
      <p>Get trip details, including passengers, comments, and reviews.</p>
    </div>

    <div class="endpoint">
      <h2>PATCH /api/trips/[id]</h2>
      <p>Update a trip as the authenticated driver. Only <code>departureTime</code> can be changed.</p>
      <pre>{ "departureTime": "18:30" }</pre>
      <p>Response:</p>
      <pre>{ "success": true }</pre>
    </div>

    <div class="endpoint">
      <h2>POST /api/trips/[id]/join</h2>
      <p>Join a trip if seats are available. Optional seat position may be provided.</p>
      <pre>{ "seatPosition": "back_left" }</pre>
    </div>

    <div class="endpoint">
      <h2>POST /api/trips/[id]/leave</h2>
      <p>Leave a trip you have joined.</p>
    </div>
  </body>
</html>`;

export async function GET() {
  return new Response(docsHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
