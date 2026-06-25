import fitz  # PyMuPDF
import re

class PDFAnalyzer:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.doc = fitz.open(self.file_path)
        
    def extract_metadata(self) -> dict:
        """Extracts PDF metadata to check for suspicious editing software."""
        metadata = self.doc.metadata
        return {
            "creator": metadata.get("creator", ""),
            "producer": metadata.get("producer", ""),
            "creation_date": metadata.get("creationDate", ""),
            "mod_date": metadata.get("modDate", "")
        }

    def extract_text_blocks(self) -> list:
        """
        Extracts text blocks with full positioning, font size, and font name.
        Crucial for detecting font mismatches and layout anomalies.
        """
        text_blocks = []
        for page_num in range(len(self.doc)):
            page = self.doc.load_page(page_num)
            blocks = page.get_text("dict")["blocks"]
            
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text_blocks.append({
                                "page": page_num,
                                "text": span["text"].strip(),
                                "font": span["font"],
                                "size": span["size"],
                                "bbox": span["bbox"], # (x0, y0, x1, y1)
                                "color": span["color"]
                            })
        return [tb for tb in text_blocks if tb["text"]] # Filter out empty text

    def get_certificate_dimensions(self) -> dict:
        """Returns the dimensions of the first page to calculate center alignment."""
        page = self.doc.load_page(0)
        rect = page.rect
        return {
            "width": rect.width,
            "height": rect.height,
            "center_x": rect.width / 2,
            "center_y": rect.height / 2
        }

    def close(self):
        self.doc.close()