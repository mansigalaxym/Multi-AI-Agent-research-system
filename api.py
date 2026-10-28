
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Change this import to match the filename containing
# your run_research_pipeline() function.
from pipeline import run_research_pipeline

app = FastAPI(title="AI Research Report Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300)


@app.get("/")
def home():
    return {"message": "Research API is running"}


@app.post("/api/research")
def generate_research(request: ResearchRequest):
    try:
        result = run_research_pipeline(request.topic.strip())

        return {
            "topic": request.topic,
            "search_results": result.get("search_results", ""),
            "scraped_content": result.get("scraped_content", ""),
            "report": result.get("report", ""),
            "feedback": result.get("feedback", ""),
        }

    except Exception as exc:
        # Keep detailed exception information in the backend terminal.
        print(f"Research pipeline error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Research generation failed. Check the backend terminal.",
        )
