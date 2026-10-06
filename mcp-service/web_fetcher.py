import requests
from bs4 import BeautifulSoup
from models.web_schemas import WebFetchResponse

def procesar_lectura_web(url: str) -> WebFetchResponse:
    """
    Downloads and extracts clean text from a webpage or article.
    """
    try:
        # Standard User-Agent to prevent basic scraping blocks
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove noisy elements that do not contribute to the main content
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.extract()
            
        # Extract plain text and limit size to avoid LLM context overflow
        clean_text = soup.get_text(separator=' ', strip=True)[:15000]
        
        return WebFetchResponse(
            url_source=url,
            character_count=len(clean_text),
            clean_text=clean_text
        )
        
    except Exception as e:
        return WebFetchResponse(
            url_source=url,
            character_count=0,
            clean_text="",
            error=f"Failed to process the URL: {str(e)}"
        )