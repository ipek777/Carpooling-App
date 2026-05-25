# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# CarpoolGo: Carpooling Mobile App
- CarpoolGo app: organize and take part in carpools (drivers create carpooling listings, passengers view listings and join carpools)

# Tech Guidelines
- Technologies: React Native + Expo
- Back-end: CarpoolGo RESTful API, with "Bearer token" auth
- Back-end API source code: '..\carpooling-web\src\app\api'
- Use modular design: split the app into meaningful components, to avoid long complex files with too much code and reuse repeating code

# Mobile User Interface Guidelines
- Implement userr-friendly UI, stack navigation, responsive layout (for tablets / smartphones)
- Mobile UI Alerts: ensure all native alerts, confirms and other system design dialogs have a fallback for Web (implemented as modal popups)
