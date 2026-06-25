import os
from app.services.pdf_analyzer import PDFAnalyzer

class TemplateManager:
    def __init__(self):
        self.template_dir = "data/templates"
        self.templates = {}
        self.load_templates()

    def load_templates(self):
        """Analyzes all original certificates in the templates folder."""
        if not os.path.exists(self.template_dir):
            os.makedirs(self.template_dir)
            return

        for file in os.listdir(self.template_dir):
            if file.endswith(".pdf"):
                path = os.path.join(self.template_dir, file)
                analyzer = PDFAnalyzer(path)
                
                # Create a fingerprint: Unique fonts and their sizes
                blocks = analyzer.extract_text_blocks()
                fingerprint = {
                    "fonts": list(set([b["font"] for b in blocks])),
                    "sizes": list(set([round(b["size"], 1) for b in blocks])),
                    "static_text": " ".join([b["text"] for b in blocks[:10]]), # First 10 blocks usually platform info
                    "platform_name": file.split("_")[0].lower() # e.g., 'nptel'
                }
                self.templates[fingerprint["platform_name"]] = fingerprint
                analyzer.close()

    def find_matching_template(self, upload_text: str):
        """Identifies which platform the uploaded certificate claims to be from."""
        upload_text = upload_text.lower()
        for platform, data in self.templates.items():
            if platform in upload_text:
                return data
        return None