"""
Text normalization utilities for descriptions
"""
import re
from typing import List, Dict, Tuple


def normalize_text(text: str) -> str:
    """
    Normalize description text for better grouping:
    - Convert to lowercase
    - Remove extra whitespace
    - Remove special characters (keep alphanumeric, spaces, and basic punctuation)
    - Trim to reasonable length
    
    Args:
        text: Raw description text
        
    Returns:
        Normalized text
    """
    if not text:
        return "No description"
    
    # Convert to lowercase
    text = text.lower().strip()
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common patterns like timestamps, IDs, transaction numbers
    # Remove patterns like: UPI/12345, Ref: ABC123, etc.
    text = re.sub(r'(upi|ref|id|txn|trans|transaction)[:\s]?\w+', '', text, flags=re.IGNORECASE)
    
    # Remove email addresses and phone numbers
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\b\d{10}\b', '', text)
    
    # Remove redundant merchant names (common keywords)
    text = re.sub(r'\b(payment|paid|transferred|to|from|received|sent|via)\b', '', text, flags=re.IGNORECASE)
    
    # Remove extra whitespace again after cleaning
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Keep only alphanumeric, spaces, and basic punctuation
    text = re.sub(r'[^\w\s\-\.]', '', text)
    
    # Limit length
    if len(text) > 100:
        text = text[:100].rsplit(' ', 1)[0]  # Truncate at word boundary
    
    # Final check
    if not text or text.isspace():
        return "No description"
    
    return text.strip()


def group_descriptions(descriptions: List[str]) -> List[Tuple[str, int]]:
    """
    Group similar descriptions together after normalization.
    
    Args:
        descriptions: List of raw description texts
        
    Returns:
        List of (normalized_description, count) tuples sorted by count
    """
    normalized_map: Dict[str, int] = {}
    
    for desc in descriptions:
        if desc:
            normalized = normalize_text(desc)
            normalized_map[normalized] = normalized_map.get(normalized, 0) + 1
    
    # Sort by count (descending)
    return sorted(normalized_map.items(), key=lambda x: x[1], reverse=True)


def similarity_score(str1: str, str2: str) -> float:
    """
    Calculate similarity between two strings (0.0 to 1.0).
    Uses simple overlap method.
    
    Args:
        str1: First string
        str2: Second string
        
    Returns:
        Similarity score from 0 to 1
    """
    s1 = set(str1.split())
    s2 = set(str2.split())
    
    if not s1 or not s2:
        return 0.0
    
    intersection = len(s1 & s2)
    union = len(s1 | s2)
    
    return intersection / union if union > 0 else 0.0
