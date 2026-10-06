from pydantic import BaseModel, HttpUrl, Field

class WebFetchRequest(BaseModel):
    """Request schema for the web fetching tool."""
    url: HttpUrl = Field(
        ..., 
        description="The complete HTTP or HTTPS URL of the webpage to scrape and extract text from."
    )

class WebFetchResponse(BaseModel):
    """Response schema containing the extracted text or an error message."""
    url_source: str = Field(
        ..., 
        description="The original URL that was requested."
    )
    character_count: int = Field(
        ..., 
        description="The total number of characters extracted after cleaning the HTML."
    )
    clean_text: str = Field(
        ..., 
        description="The extracted plain text content, stripped of HTML tags, scripts, and styles."
    )
    error: str | None = Field(
        None, 
        description="Error message if the request failed, otherwise None."
    )