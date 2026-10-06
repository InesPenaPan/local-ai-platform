from mcp.server.fastmcp import FastMCP
from models.web_schemas import WebFetchRequest
from web_fetcher import process_web_fetch

mcp = FastMCP("LocalToolsHub", dependencies=["requests", "beautifulsoup4", "pydantic"])

@mcp.tool()
def fetch_webpage(url: str) -> str:
    """Downloads and extracts clean text from an article or webpage."""
    request_data = WebFetchRequest(url=url)
    result = process_web_fetch(str(request_data.url))
    
    if result.error:
        return result.error
    return result.clean_text

if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8005)