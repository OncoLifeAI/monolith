import os
import docx
from pypdf import PdfReader
from typing import List

class ContextLoader:
    """
    Loads context from files in a specified directory.
    """
    def __init__(self, directory: str):
        self.directory = directory

    def _load_docx(self, file_path: str) -> str:
        """Loads text from a .docx file."""
        doc = docx.Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _load_pdf(self, file_path: str) -> str:
        """Loads text from a .pdf file."""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text

    def _load_txt(self, file_path: str) -> str:
        """Loads text from a .txt file."""
        with open(file_path, 'r') as f:
            return f.read()

    def load_system_prompt(self) -> str:
        """
        Loads the system prompt from 'system_prompt.txt'.
        """
        system_prompt_path = os.path.join(self.directory, "system_prompt.txt")
        if os.path.exists(system_prompt_path):
            return self._load_txt(system_prompt_path)
        return ""

    def load_context(self) -> str:
        """
        Loads all documents from the specified directory and concatenates their content,
        excluding the system prompt.
        """
        full_context = []
        for filename in os.listdir(self.directory):
            if filename == "system_prompt.txt":
                continue  # Skip the system prompt file
            
            file_path = os.path.join(self.directory, filename)
            content = ""
            if filename.endswith(".pdf"):
                print(f"Loading PDF: {file_path}")
                content = self._load_pdf(file_path)
            elif filename.endswith(".docx"):
                print(f"Loading DOCX: {file_path}")
                content = self._load_docx(file_path)
            elif filename.endswith(".txt"):
                print(f"Loading TXT: {file_path}")
                content = self._load_txt(file_path)
            
            if content:
                full_context.append(content)
        
        return "\n\n---\n\n".join(full_context) 