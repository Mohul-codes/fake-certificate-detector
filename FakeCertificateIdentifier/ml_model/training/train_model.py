import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib

# Ensure the models directory exists inside the backend
MODEL_DIR = "../../backend/app/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def create_dummy_dataset():
    """Generates a basic dataset for Text Pattern Analysis."""
    data = [
        {"text": "This is to certify that John Doe has successfully completed the course Machine Learning by Stanford University. Certificate ID: 12345", "label": 0}, # 0 = Genuine
        {"text": "Certificate of Completion awarded to Jane Smith for Data Science Bootcamp. Verified by Coursera. ID: 98765", "label": 0},
        {"text": "NPTEL Online Certification. This certificate is awarded to Rahul Kumar for successfully completing the course.", "label": 0},
        {"text": "Certifcate of compltion John Doe Machine Learnig. ID 123", "label": 1}, # 1 = Fake (Typos, poor structure)
        {"text": "Awarded to edited_name for taking the course. Photoshop edited.", "label": 1},
        {"text": "Dummy text certificate fake template placeholder name John.", "label": 1}
    ]
    return pd.DataFrame(data)

def train_and_save_model():
    print("Generating dataset...")
    df = create_dummy_dataset()
    
    print("Building TF-IDF and Random Forest Pipeline...")
    # Pipeline: Vectorize text -> Train Random Forest
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english', max_features=100)),
        ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train the model
    pipeline.fit(df['text'], df['label'])
    
    # Save the pipeline
    model_path = os.path.join(MODEL_DIR, "text_pattern_model.pkl")
    joblib.dump(pipeline, model_path)
    print(f"Model successfully saved to {model_path}")

if __name__ == "__main__":
    train_and_save_model()