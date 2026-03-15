# 🚗 Car Score Predictor

> ⚠️ **This project is actively under development.** The current codebase is an early version and will be replaced with a fully restructured repo. See the [Planned Updates](#-planned-updates) section for what's coming.

A full-stack mobile and web application that scores used car listings to help identify deals. It combines a neural network scoring model, an NLP-driven prediction interface, a web scraper that populates a live car database, and a React Native frontend — all wired together through a Python backend.

The goal is to cut through the noise of used car shopping by giving every listing a data-driven value score, so you can immediately see which cars are actually worth your time.

---

## 📁 Project Structure

```
car-score-predictor/
├── CarScorePredictor/   # React Native frontend (Expo)
├── car_score_api/       # Python Flask backend
├── model/               # Neural network training notebook (cars.ipynb)
├── scripts/             # Web scraper (car_eating.py)
├── env/                 # Config setup (temp_config.py → config.py)
├── car_dump.sql         # MySQL database dump
├── run-all.sh           # Start everything at once
├── run-backend.sh
├── run-frontend.sh
└── run-webscrape.sh
```

---

## 🌿 Branches

| Branch | Description |
|--------|-------------|
| `main` | AWS-hosted backend and database, frontend distributed as APK |
| `local-instance` | Backend and database running on local network |

---

## 🧩 Features

### 📊 Predict Tab
Enter a car's details in plain text and get back a value score. The NLP pipeline parses free-form input and extracts the relevant fields, so you don't have to fill out a form. Supported fields include year, make/model, mileage, price, condition, dealer vs. private, monthly payment, accident history, number of owners, and personal vs. commercial use. For best results, include at least the year, model, mileage, and price.

### 🗃️ Database Tab
A live, browsable database of used car listings collected by the web scraper, each scored and sorted by projected value. Filter by price, mileage, make/model, and US state. Listings flagged as "perfect history" have a clean title, single owner, and no accidents — useful for quickly narrowing down the best candidates.

---

## ⚙️ Setup

### Requirements
- MySQL database
- Python 3 with Flask and dependencies
- Node.js + Expo CLI

### Configuration
1. Navigate to `env/` and fill out `temp_config.py` with your database credentials, IP, and port.
2. Rename it to `config.py`.
3. Run `export_config.py` to push the config to the frontend.

### Model
Navigate to `model/` and run `cars.ipynb` to train and generate the scoring model.

### Frontend
```bash
cd CarScorePredictor
npm install expo
```

---

## ▶️ Running the App

The easiest way is via the provided shell scripts:

```bash
./run-all.sh         # Start backend + frontend
./run-all.sh -rs     # Start backend + frontend + web scraper
```

Or manually, in order:

```bash
# 1. Make sure your MySQL database is running

# 2. Start the backend
cd car_score_api
python server.py

# 3. Push config to frontend (if needed)
cd env
python export_config.py

# 4. Start the frontend
cd CarScorePredictor
npx expo start

# 5. Run the web scraper (if needed)
cd scripts
python car_eating.py
```

---

## 🔧 Planned Updates

This repo will be fully restructured. Planned changes include:

- **Updated scoring algorithm** — improved model accuracy and scoring methodology
- **Cross-platform release** — iOS, Android, and Web via React Native
- **Updated NLP pipeline** — better parsing of free-text car descriptions for score predictions
- **Auto-updating database** — daily scraper runs to keep listings fresh and continuously retrain the scoring model
- **Local model inferencing** — scoring model runs directly on a self-hosted server, removing cloud dependency

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native, Expo, TypeScript |
| Backend | Python, Flask |
| Database | MySQL |
| Scoring Model | Neural Network (Jupyter / Python) |
| NLP Input | Text-driven prediction pipeline |
| Data Collection | Python web scraper |
| Hosting (main) | AWS |
| Hosting (local) | Local network server |

---

