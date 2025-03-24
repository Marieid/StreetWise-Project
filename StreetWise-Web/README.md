# StreetWise Web App

The **StreetWise Web App** is an administrative dashboard built with **Django**, designed to manage, visualize, and analyze user-reported safety incidents from the companion mobile app.

It enables project evaluators and system maintainers to monitor the platform usage, report trends, and access raw data securely.

---

## Features

- Admin authentication
- View list of reported incidents
- Access user feedback and votes
- Data visualization of incidents over time
- Export and manage reports
- Filter by incident type or date
- User credibility tracking

---

## Folder Structure

```
/web-app
├── core/                 # Main Django app logic
├── templates/           # HTML templates
├── static/              # CSS/JS/Chart files
├── credentials/         # Service keys (ignored in Git)
├── manage.py            # Django CLI entrypoint
├── requirements.txt      # Python dependencies
└── ...
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/streetwise.git
cd streetwise/web-app
```

### 2. Create and activate virtual environment

```bash
python -m venv env
source env/bin/activate  # on Windows: env\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up `.env`

Create a `.env` file in the root:

```
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True
```

Also ensure `credentials/serviceAccountKey.json` exists for Firebase integration if used.

---

### 5. Run the development server

```bash
python manage.py migrate
python manage.py runserver
```

Access the dashboard at: [http://localhost:8000](http://localhost:8000)

---

## Tech Stack

- Python 3.10+
- Django 4.x
- SQLite / PostgreSQL
- Chart.js for visualizations
- Bootstrap 5
- Firebase Admin SDK (optional)

---

## Preview

_Dashboard sample:_

<img src="https://github.com/user-attachments/assets/3f9a2628-2791-40e8-9802-1d88e65f94d3" width="1000"/> <img src="https://github.com/user-attachments/assets/79d81992-194b-467b-a86a-aac671304d4a" width="1000"/> <img src="https://github.com/user-attachments/assets/cb2cd32f-5ab8-4cd2-a244-156fa817b8fa" width="1000"/> <img src="https://github.com/user-attachments/assets/69f5bc01-3354-4d2b-b982-bd969d38811e" width="1000"/> <img src="https://github.com/user-attachments/assets/b544c593-249e-44c8-83f4-8502ddf76a94" width="100"/>

---

## To-Do

- Add authentication tokens for secure mobile ↔ web data sync
- Enhance charts with filters
- Add download/export CSV functionality

---

## Developed By

This project is part of the final year CM3070 **BSc Computer Science** project — University of London.

---

## License

MIT License
