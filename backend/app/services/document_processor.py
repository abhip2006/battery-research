"""
Document processing service for RAG system.
Handles document loading, chunking, and metadata extraction.
"""
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import markdown
from bs4 import BeautifulSoup


class DocumentChunk:
    """Represents a processed document chunk."""
    
    def __init__(
        self,
        content: str,
        source_document: str,
        chunk_index: int,
        section_title: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        self.content = content
        self.source_document = source_document
        self.chunk_index = chunk_index
        self.section_title = section_title
        self.chunk_metadata = metadata or {}
        self.content_hash = self._generate_hash()
    
    def _generate_hash(self) -> str:
        """Generate SHA-256 hash of content for deduplication."""
        return hashlib.sha256(self.content.encode()).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage."""
        return {
            "content": self.content,
            "source_document": self.source_document,
            "chunk_index": self.chunk_index,
            "section_title": self.section_title,
            "metadata": self.chunk_metadata,
            "content_hash": self.content_hash
        }


class MarkdownDocumentProcessor:
    """
    Processes markdown documents for RAG system.
    
    Features:
    - Section-aware chunking
    - Metadata extraction
    - Citation tracking
    - Overlap handling for context continuity
    """
    
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
        min_chunk_size: int = 100
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_size = min_chunk_size
    
    def load_document(self, file_path: str) -> str:
        """Load markdown document from file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def extract_sections(self, content: str) -> List[Dict[str, str]]:
        """
        Extract sections from markdown based on headers.
        Returns list of {title, content, level} dicts.
        """
        sections = []
        current_section = {"title": "Introduction", "content": "", "level": 0}
        
        lines = content.split('\n')
        for line in lines:
            # Check for markdown headers
            header_match = re.match(r'^(#{1,6})\s+(.+)$', line)
            if header_match:
                # Save previous section if it has content
                if current_section["content"].strip():
                    sections.append(current_section)
                
                # Start new section
                level = len(header_match.group(1))
                title = header_match.group(2).strip()
                current_section = {
                    "title": title,
                    "content": "",
                    "level": level
                }
            else:
                current_section["content"] += line + '\n'
        
        # Add final section
        if current_section["content"].strip():
            sections.append(current_section)
        
        return sections
    
    def chunk_text(
        self,
        text: str,
        section_title: Optional[str] = None
    ) -> List[str]:
        """
        Split text into chunks with overlap.
        Uses character-based chunking with word boundaries.
        """
        if len(text) <= self.chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            # Calculate end position
            end = start + self.chunk_size
            
            # If this is not the last chunk, find word boundary
            if end < len(text):
                # Look backwards for a word boundary
                while end > start and not text[end].isspace():
                    end -= 1
                
                # If we couldn't find a space, just cut at chunk_size
                if end == start:
                    end = start + self.chunk_size
            else:
                end = len(text)
            
            chunk = text[start:end].strip()
            
            # Only add if chunk meets minimum size
            if len(chunk) >= self.min_chunk_size:
                # Prepend section title for context
                if section_title:
                    chunk = f"# {section_title}\n\n{chunk}"
                chunks.append(chunk)
            
            # Move start position with overlap
            start = end - self.chunk_overlap if end < len(text) else end
        
        return chunks
    
    def process_document(
        self,
        file_path: str
    ) -> Tuple[List[DocumentChunk], Dict[str, Any]]:
        """
        Process a markdown document into chunks.
        
        Returns:
            Tuple of (chunks, metadata)
        """
        # Load document
        content = self.load_document(file_path)
        file_name = Path(file_path).name
        
        # Extract sections
        sections = self.extract_sections(content)
        
        # Process each section into chunks
        all_chunks = []
        chunk_index = 0
        
        for section in sections:
            section_content = section["content"]
            section_title = section["title"]
            
            # Skip empty sections
            if not section_content.strip():
                continue
            
            # Chunk the section
            text_chunks = self.chunk_text(section_content, section_title)
            
            for text_chunk in text_chunks:
                doc_chunk = DocumentChunk(
                    content=text_chunk,
                    source_document=file_name,
                    chunk_index=chunk_index,
                    section_title=section_title,
                    metadata={
                        "section_level": section["level"],
                        "file_path": file_path
                    }
                )
                all_chunks.append(doc_chunk)
                chunk_index += 1
        
        # Generate document metadata
        file_stats = Path(file_path).stat()
        metadata = {
            "file_path": file_path,
            "file_name": file_name,
            "file_size": file_stats.st_size,
            "total_chunks": len(all_chunks),
            "total_sections": len(sections),
            "file_hash": self._hash_file(file_path)
        }
        
        return all_chunks, metadata
    
    def _hash_file(self, file_path: str) -> str:
        """Generate SHA-256 hash of file content."""
        hasher = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    def extract_citations(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract citation-worthy information from text.
        Looks for:
        - Numbers/statistics
        - Company names
        - Dates
        - Key facts
        """
        citations = []
        
        # Find statistics (numbers with units)
        stat_pattern = r'\b(\d+(?:,\d+)*(?:\.\d+)?)\s*([A-Za-z]+)\b'
        for match in re.finditer(stat_pattern, text):
            citations.append({
                "type": "statistic",
                "value": match.group(1),
                "unit": match.group(2),
                "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })
        
        # Find dollar amounts
        dollar_pattern = r'\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:billion|million|B|M|k|kWh|GWh)?'
        for match in re.finditer(dollar_pattern, text):
            citations.append({
                "type": "monetary",
                "value": match.group(0),
                "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })
        
        # Find years
        year_pattern = r'\b(19|20)\d{2}\b'
        for match in re.finditer(year_pattern, text):
            citations.append({
                "type": "year",
                "value": match.group(0),
                "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })
        
        return citations


def count_tokens_approximate(text: str) -> int:
    """
    Approximate token count for text.
    Uses rough heuristic of 1 token ≈ 4 characters.
    For production, use tiktoken library.
    """
    return len(text) // 4


def batch_chunks(chunks: List[DocumentChunk], batch_size: int = 100) -> List[List[DocumentChunk]]:
    """Split chunks into batches for processing."""
    return [chunks[i:i + batch_size] for i in range(0, len(chunks), batch_size)]
