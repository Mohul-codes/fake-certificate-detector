#  Fake Certificate Detector

> **Fake Certificate Detector** — a FastAPI + React prototype that analyzes uploaded PDF certificates using structural heuristics and an ML text-anomaly model to flag likely **FAKE** certificates. Includes tools to parse PDFs, compare templates, detect font/alignment anomalies, and (re)train the detection model.

---

## What Is This?

Fake Certificate Detector is a small full-stack project that detects tampered or fake academic certificates by extracting PDF text/structure and running **heuristic + ML checks** to produce a **FAKE / GENUINE** prediction. It's intended for developers or institutions who want a local service to analyze uploaded PDF certificates.

---

## Stack

| Layer | Technology |
|---|---|
| **Frontend** | JavaScript (React-based SPA, served on `localhost:3000`) |
| **Backend** | Python — [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) |
| **PDF Parsing** | [PyMuPDF](https://pymupdf.readthedocs.io/) & [pdfplumber](https://github.com/jsvine/pdfplumber) |
| **ML / Data** | [scikit-learn](https://scikit-learn.org/), pandas, numpy |
| **Other** | Pillow (image processing) |

---

##  Project Structure

```
FakeCertificateIdentifier/              # Top-level project folder
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app + upload endpoint
│   │   ├── services/
│   │   │   ├── decision_engine.py      # Orchestrates feature extraction + ML prediction
│   │   │   ├── tampering_detector.py   # Extracts structural/font/metadata features from PDFs
│   │   │   ├── pdf_analyzer.py         # PDF parsing helpers (PyMuPDF / pdfplumber)
│   │   │   └── template_manager.py     # Template matching logic
│   │   └── models/                     # ML predictor wrapper (MLPredictor)
│   ├── data/                           # Data storage / example data
│   ├── uploads/                        # Runtime upload directory (created at runtime)
│   └── requirements.txt                # Python dependencies for backend
├── frontend/                           # JavaScript UI (npm start → localhost:3000)
└── ml_model/
    └── training/                       # Training scripts for the ML model
        └── train_model.py
Readme.txt                              # Minimal run instructions
.gitignore
```

---

##  How It Fits Together

```
┌──────────────┐    POST /api/v1/analyze    ┌─────────────────────────┐
│   React UI   │ ─────────────────────────▶ │    FastAPI Backend       │
│ localhost:3000│ ◀───────────────────────── │    localhost:8000        │
└──────────────┘    { score, prediction }    │                         │
                                            │  ┌─────────────────┐    │
                                            │  │ DecisionEngine  │    │
                                            │  │                 │    │
                                            │  │ ┌─────────────┐ │    │
                                            │  │ │ Tampering   │ │    │
                                            │  │ │ Detector    │ │    │
                                            │  │ └─────────────┘ │    │
                                            │  │ ┌─────────────┐ │    │
                                            │  │ │ MLPredictor │ │    │
                                            │  │ └─────────────┘ │    │
                                            │  └─────────────────┘    │
                                            └─────────────────────────┘
```

1. The **FastAPI backend** (`app.main`) exposes `POST /api/v1/analyze` which accepts a PDF, saves it to `uploads/`, and runs the `DecisionEngine` on the saved file.
2. **DecisionEngine** uses `TamperingDetector` to extract template / font / alignment / metadata features from the PDF and an `MLPredictor` to compute a text-anomaly score.
3. Those scores are combined into a **final score** and a **FAKE / GENUINE** prediction (threshold = `45.0`, template_mismatch weight = `0.40`).
4. The **frontend** (React app) communicates with the backend at `localhost:8000` (CORS configured to allow `http://localhost:3000`).
5. The `ml_model/training` folder contains scripts to train or re-train the scikit-learn model used by `MLPredictor`.

---

##  How to Run

> **Prerequisites:** Python 3.10+ and Node.js / npm installed.

### 1. Backend (FastAPI API)

```bash
# (optional) create & activate a virtualenv
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

# Install dependencies
pip install -r FakeCertificateIdentifier/backend/requirements.txt

# Start the API server
cd FakeCertificateIdentifier/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at **http://localhost:8000**.

### 2. Frontend (React Dev Server)

```bash
cd FakeCertificateIdentifier/frontend
npm install
npm start
```

The frontend will run on **http://localhost:3000** and communicates with the backend at `http://localhost:8000`.

### 3. Train / Re-train ML Model (if needed)

```bash
cd FakeCertificateIdentifier/ml_model/training
python train_model.py
```

> **Note:** If no pre-trained model artifact is present, run the training script first to generate the model used by `MLPredictor`.

---

##  Notes

- The backend dependencies are listed in `FakeCertificateIdentifier/backend/requirements.txt` (FastAPI, uvicorn, PyMuPDF, pdfplumber, Pillow, scikit-learn, pandas, numpy).
- CORS in `main.py` allows `http://localhost:3000` — backend default port is **8000** (uvicorn).
- Uploaded PDFs are temporarily written to `uploads/` then removed after processing.

---

