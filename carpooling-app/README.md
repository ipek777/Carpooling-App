# CarpoolGo: Carpooling App
A software for people to share rides, reducing travel costs and environmental impact by filling empty car seats.
- The app holds trips, where shared rides are organized.
- Users can act as drivers (offering rides) or passengers (booking seats).
- Trips are published on the platform, and passengers can search, book / cancel / rate / comment on them.

# Roles in the App
- Visitor: can view the home page, search for public trips, and register in the app.
- Registered User: can manage their own profile, search for trips, and choose to become a driver or a passenger.
- Passenger: can view trip details, book / cancel a seat, and leave a review on a trip.
- Driver: can create a trip, manage their trips, and monitor their passengers.
- Admins: can view / manage all users, trips, and system data.

# Visitors
Visitors are anonymous actors who visit the app Web site or Mobile app.
- Visitors can see the app home page, search for available trips by origin and destination, and register (by email + password) in the app.

# Registered Users
Registered users in the app have a profile with a name, email, and photo (optional) and can login / logout.
- Registered users can seamlessly switch between being a driver (by creating a trip) or a passenger (by booking a trip).
- Users can view their personal history of past trips (both driven and traveled).

# Drivers
Drivers manage the trips they offer and coordinate with their passengers.
- Drivers organize trips on the platform:
    - Create / edit / cancel / delete trips.
    - Share a trip link (copy a shareable trip URL).
    - Trips hold: date, departure time, origin, destination, price per seat, capacity (number of available seats, default 3 or 4), available specific seats (e.g., front passenger, back left, back middle, back right), and canceled (yes/no).
- Drivers can view the list of passengers and exactly which seat each passenger has booked.
- Drivers can remove passengers from their trips if necessary (e.g., due to a lack of communication).

# Passengers and Trips
Passengers can browse and search for trips: upcoming, current, and past trips.
- Always display the state of each trip: upcoming | in progress | past, note if canceled, and show capacity status: full | seats available. 
- A trip is upcoming if its departure time is not yet reached. At its start time, the trip becomes in progress for its estimated duration. After that, the trip becomes past.
- A trip can be canceled by a driver, so it will not occur. All booked passengers should see this status.
- A trip is open to book / unbook when it is upcoming, not canceled, and has available seats.
- Display the list of co-passengers for the trip (users currently booked and their designated seats).

Passengers can book / unbook a trip:
- Passengers can book a seat on a trip (if they haven't already and there are available seats).
- Passengers can cancel their booking (leave the trip) before the departure time (optionally, leaving a comment for the driver).
- When booking, a passenger must select a specific available seat in the car (e.g., "Front Row", "Back Row Left", "Back Row Middle", "Back Row Right").
- The system should visually indicate which seats are taken and which are free, preventing passengers from booking a seat that is already occupied.

Passengers and Drivers can post comments on trips:
- Examples: "I am waiting at the gas station", "Can I bring a small suitcase?", "Traffic is heavy, I will be 5 minutes late", etc.
- Comments are listed on the specific trip's details screen.
- Comments can be edited / deleted by their owner, and drivers can moderate comments on their own trips.

# Web App and Mobile App
- The Web app is the primary app for this project. It implements the entire app functionality: user profile management, detailed trip management, advanced search, and admin panel functionality.
- The mobile app is an additional, scope-limited app, which implements only the most important end-user functionality: login / register, search for trips, book / unbook a trip, and view/comment on active upcoming trips while on the go.