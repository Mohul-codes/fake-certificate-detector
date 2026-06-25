from app.services.pdf_analyzer import PDFAnalyzer
from app.services.template_manager import TemplateManager

class TamperingDetector:
    def __init__(self, file_path: str):
        self.analyzer = PDFAnalyzer(file_path)
        self.template_mgr = TemplateManager()
        self.suspicious_software = ["Adobe Photoshop", "Canva", "PDF Editor", "Illustrator", "CorelDRAW"]

    def check_template_matching(self, text_blocks: list, full_text: str) -> float:
        """Compares uploaded file structure against original platform templates."""
        template = self.template_mgr.find_matching_template(full_text)
        if not template:
            return 0.0 # No reference template found for this platform

        # Font Validation: Does the upload use fonts NOT present in the original?
        upload_fonts = set([b["font"] for b in text_blocks])
        template_fonts = set(template["fonts"])
        
        # Fonts in upload that are NOT in the original template
        mismatched_fonts = upload_fonts - template_fonts
        
        # If more than 2 fonts are different from the original, it's highly suspicious
        score = len(mismatched_fonts) * 20.0
        return min(score, 100.0)

    def identify_name_region(self, text_blocks: list) -> dict:
        """
        Heuristic: The student name is typically the largest or second-largest font on the page,
        usually placed centrally. We sort by size to isolate probable title and name.
        """
        if not text_blocks:
            return None
        
        # Sort blocks by font size descending
        sorted_blocks = sorted(text_blocks, key=lambda x: x["size"], reverse=True)
        
        # Return the top 3 largest text blocks to analyze
        return sorted_blocks[:3]

    def check_font_anomaly(self, name_blocks: list, all_blocks: list) -> float:
        """Calculates a font mismatch score in the name region."""
        if not name_blocks:
            return 0.0

        all_fonts = set(b["font"] for b in all_blocks)
        name_fonts = set(b["font"] for b in name_blocks)
        
        non_name_fonts = all_fonts - name_fonts
        
        score = 0.0
        for block in name_blocks:
            # If the font is completely unique to the presumed name region
            if block["font"] not in non_name_fonts:
                score += 30.0
        
        return min(score, 100.0)

    def check_alignment_anomaly(self, name_blocks: list, dimensions: dict) -> float:
        """Checks if the bounding box of the name is horizontally centered."""
        if not name_blocks:
            return 0.0
            
        score = 0.0
        center_x = dimensions["center_x"]
        
        for block in name_blocks:
            bbox = block["bbox"] # (x0, y0, x1, y1)
            block_center_x = (bbox[0] + bbox[2]) / 2
            
            # Calculate percentage deviation from the true center
            deviation = abs(center_x - block_center_x) / dimensions["width"]
            
            # If deviation is greater than 5% of page width, it's poorly aligned
            if deviation > 0.05:
                score += 25.0
                
        return min(score, 100.0)

    def analyze_metadata(self, metadata: dict) -> float:
        """Checks if the PDF was modified by known image/PDF editing software."""
        score = 0.0
        producer = metadata.get("producer", "").lower()
        creator = metadata.get("creator", "").lower()
        
        combined_meta = f"{producer} {creator}"
        
        for software in self.suspicious_software:
            if software.lower() in combined_meta:
                score += 50.0
                
        c_date = metadata.get("creation_date", "")
        m_date = metadata.get("mod_date", "")
        if c_date and m_date and c_date != m_date:
            score += 15.0
            
        return min(score, 100.0)

    def extract_features(self, full_text: str) -> dict:
        """Runs all checks and returns a combined feature dictionary."""
        try:
            text_blocks = self.analyzer.extract_text_blocks()
            metadata = self.analyzer.extract_metadata()
            dimensions = self.analyzer.get_certificate_dimensions()
            
            name_candidates = self.identify_name_region(text_blocks)
            
            template_score = self.check_template_matching(text_blocks, full_text)
            font_score = self.check_font_anomaly(name_candidates, text_blocks)
            alignment_score = self.check_alignment_anomaly(name_candidates, dimensions)
            metadata_score = self.analyze_metadata(metadata)
            
            return {
                "template_mismatch_score": template_score,
                "font_anomaly_score": font_score,
                "alignment_anomaly_score": alignment_score,
                "metadata_anomaly_score": metadata_score,
                "metadata_details": metadata
            }
        finally:
            # We put this in a finally block to guarantee the PDF closes 
            # even if an unexpected error occurs, preventing WinError 32.
            self.analyzer.close()