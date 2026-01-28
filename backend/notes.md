1/28/2026 

WEBSITE REFACTORING 

- pivot from booking handling for staySharp to external booking and payment via The Cut


ROUTES: 

## Keep: 

- GET /health
- GET /db-health
==>used by backend to verify server health
- GET /api/services 
- GET /api/barbers
=>used by booking-new.js
- GET /api/debug
- GET /api/admin/reset-db



## Retire: 

- GET /api/availability
- GET /api/appointments 
=>used by booking-new.js
- GET /api/admin/appointments
- GET /api/admin/all


## Maybe: 

- GET /api/admin/add-barbers


