import os
import joblib

class MLPredictor:
    def __init__(self):
        # Load the trained model pipeline
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(current_dir, "text_pattern_model.pkl")
        
        if os.path.exists(self.model_path):
            try:
                self.pipeline = joblib.load(self.model_path)
            except Exception as e:
                print(f"Warning: Failed to load ML model properly. {e}")
                self.pipeline = None
        else:
            self.pipeline = None
            print("Warning: ML model not found. Run train_model.py first.")

    def predict_text_anomaly(self, extracted_text: str) -> float:
        """
        Analyzes the certificate text and returns a probability score of it being fake.
        Includes a fail-safe to prevent backend crashes.
        """
        if not self.pipeline or not extracted_text.strip():
            return 0.0
            
        try:
            # Predict probability of class 1 (Fake)
            probabilities = self.pipeline.predict_proba([extracted_text])
            fake_probability = probabilities[0][1] * 100.0
            return fake_probability
        except Exception as e:
            # If the scikit-learn model throws an error (e.g., idf vector not fitted),
            # catch it, print it to terminal, and return 0.0 to let the heuristic engines take over.
            print(f"ML Prediction Error Skipped: {str(e)}")
            return 0.0