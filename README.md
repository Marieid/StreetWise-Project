# StreetWise Final Project

This repository contains both the **Mobile App (React Native + Expo)** and the **Web App (Django)** for the StreetWise platform.

StreetWise is a **community-driven pedestrian safety app** that empowers users to make safer navigation choices by crowdsourcing incident reports in real-time. It aims to increase awareness of urban safety concerns and help users avoid high-risk areas through dynamic, color-coded route planning.

---

## Repository Structure

- `/mobile-app` – React Native + Expo application for reporting/viewing safety incidents on a map.
- `/web-app` – Django-based admin and analytics dashboard for viewing incidents and generating visual reports.

---

## Project Features

### Mobile App (React Native + Firebase + Google Maps)

- Incident reporting (e.g., aggression, poor lighting, unsafe crossings).
- Real-time map updates using Firestore snapshots.
- Route safety scoring algorithm with traffic-light system (green/yellow/red).
- Google Maps API integration for directions.
- Firebase Authentication.
- Accessibility compliant (WCAG 2.1 AA).

### Web App (Django + Firestore)

- Admin dashboard for visualizing incident data.
- Heatmaps and statistical trend charts.
- Role-based access control (user/moderator/admin).
- Data synchronization with Firebase via Celery.
- RESTful API endpoints for mobile/web interaction.

---

## Project Motivation

Fear of crime limits pedestrian mobility. StreetWise addresses this by:

- Crowdsourcing real-time pedestrian safety reports.
- Offering safer route alternatives based on incident density and severity.
- Visualizing community data for authorities and users.

---

## User Personas

| User        | Concern                        | StreetWise Solution                   |
| ----------- | ------------------------------ | ------------------------------------- |
| Sarah (27F) | Walking alone at night         | Live safety alerts, route suggestions |
| James (34M) | Commuting in urban areas       | Avoid unsafe zones, dynamic reroutes  |
| Maria (40F) | Children's school route safety | Reports hazards near schools          |
| David (68M) | Elderly with mobility issues   | Accessibility-first routes, alerts    |

---

## Mobile App Setup

```bash
cd mobile-app
npm install
npx expo start
```

> Requires Google Maps API Key set via `.env` file as `REACT_APP_GOOGLE_MAPS_API_KEY`

---

## Web App Setup

```bash
cd web-app
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

> Requires `.env` file with Firebase and Django credentials

---

## Authentication & Security

- Firebase Authentication (email/password, Google Sign-In)
- Firestore security rules for role-based access
- HTTPS encryption & anonymized incident data
- Data retention policy: 12 months

---

## Data Visualizations (Web App)

- Incident Type Distribution
- Heatmap & Calendar View
- Time Series Trends
- Real-time incident markers

---

## Key Technologies

- **Frontend:** React Native, Expo, Leaflet.js
- **Backend:** Django, Django REST Framework, Firebase Firestore
- **Routing & Maps:** Google Maps API
- **Tasks & Scheduling:** Celery + Redis

---

## Testing & Evaluation

- Unit and integration testing in both apps
- A/B testing for color schemes & route suggestions
- User satisfaction & safety perception surveys

---

## Future Enhancements

- Editable incident reports
- Detailed safety score breakdowns
- Advanced search/filtering of incidents
- Offline mode & caching
- Public infrastructure data integration

---

## Ethical Considerations

- Preventing misuse (false reports, harassment)
- Promoting equitable safety visibility
- Enforcing community guidelines and moderation

---

## License

This project is for academic use only as part of the CM3070 final project and is not intended for commercial deployment.

---

## Author

Developed by Marie D. for the University of London, BSc Computer Science - CM3070 Final Project (2025).
