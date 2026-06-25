from app.services.tampering_detector import TamperingDetector
from app.models.ml_predictor import MLPredictor
import fitz

class DecisionEngine:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.detector = TamperingDetector(self.file_path)
        self.ml_predictor = MLPredictor()

    def _extract_full_text(self) -> str:
        text = ""
        try:
            doc = fitz.open(self.file_path)
            for page in doc:
                text += page.get_text("text") + " "
            doc.close()
        except Exception: pass
        return text.strip()

    def evaluate(self) -> dict:
        full_text = self._extract_full_text()
        features = self.detector.extract_features(full_text)
        text_anomaly_score = self.ml_predictor.predict_text_anomaly(full_text)
        
        # UPDATED WEIGHTS: Template mismatch is now a major factor
        weights = {
            "template_mismatch": 0.40,  # Highest weight
            "font_anomaly": 0.20,
            "alignment_anomaly": 0.15,
            "metadata_anomaly": 0.15,
            "text_anomaly": 0.10
        }
        
        final_score = (
            (features["template_mismatch_score"] * weights["template_mismatch"]) +
            (features["font_anomaly_score"] * weights["font_anomaly"]) +
            (features["alignment_anomaly_score"] * weights["alignment_anomaly"]) +
            (features["metadata_anomaly_score"] * weights["metadata_anomaly"]) +
            (text_anomaly_score * weights["text_anomaly"])
        )
        
        final_score = min(round(final_score, 2), 100.0)
        prediction = "FAKE" if final_score >= 45.0 else "GENUINE"
        
        reasons = []
        if features["template_mismatch_score"] > 30:
            reasons.append("Structure deviates significantly from official platform template.")
        if features["font_anomaly_score"] > 20:
            reasons.append("Non-standard fonts detected in name region.")
        if features["metadata_anomaly_score"] > 0:
            reasons.append("File metadata suggests use of design software (Photoshop/Canva).")

        return {
            "prediction": prediction,
            "probability_score": final_score,
            "reasons": reasons,
            "feature_scores": {
                "template_match": round(100 - features["template_mismatch_score"], 2),
                "font_consistency": round(100 - features["font_anomaly_score"], 2),
                "metadata_score": round(features["metadata_anomaly_score"], 2)
            }
        }