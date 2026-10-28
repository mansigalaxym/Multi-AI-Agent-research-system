
import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/api/research";

function App() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport(event) {
    event.preventDefault();

    if (topic.trim().length < 3) {
      setError("Please enter a topic with at least 3 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate report.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Check whether FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <div className="brand-icon">R</div>
          <span>ResearchAI</span>
        </div>
        <span className="status">
          <span className="status-dot" />
          AI Research Assistant
        </span>
      </header>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">YOUR AI RESEARCH WORKSPACE</span>
          <h1>Turn a topic into a research report.</h1>
          <p>
            Search reliable sources, explore detailed content, and generate
            a structured report with AI-powered review.
          </p>

          <form className="search-form" onSubmit={generateReport}>
            <label htmlFor="topic">What would you like to research?</label>
            <textarea
              id="topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Example: How is generative AI changing healthcare?"
              rows={3}
              maxLength={300}
              disabled={loading}
            />
            <div className="form-footer">
              <span>{topic.length}/300 characters</span>
              <button type="submit" disabled={loading}>
                {loading ? "Researching..." : "Generate report →"}
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <section className="loading-card" aria-live="polite">
            <div className="spinner" />
            <h2>Your research is in progress</h2>
            <p>
              The search, reader, writer, and critic stages may take a few
              minutes. Please keep this page open.
            </p>
          </section>
        )}

        {error && (
          <div className="error" role="alert">
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <section className="results">
            <div className="result-heading">
              <div>
                <span className="eyebrow">RESEARCH COMPLETE</span>
                <h2>{result.topic}</h2>
              </div>
              <button
                className="secondary-button"
                onClick={() => {
                  const blob = new Blob([result.report || ""], {
                    type: "text/plain;charset=utf-8",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "research-report.txt";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download report
              </button>
            </div>

            <ResultSection
              title="Final research report"
              content={result.report}
            />
            <ResultSection
              title="Critic review"
              content={result.feedback}
            />
            <ResultSection
              title="Search results"
              content={result.search_results}
            />
            <ResultSection
              title="Scraped content"
              content={result.scraped_content}
            />
          </section>
        )}
      </main>

      <footer>
        ResearchAI · React + FastAPI + LangChain
      </footer>
    </div>
  );
}

function ResultSection({ title, content }) {
  const [expanded, setExpanded] = useState(title === "Final research report");

  if (!content) return null;

  return (
    <section className="result-card">
      <button
        className="section-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span>{title}</span>
        <span>{expanded ? "−" : "+"}</span>
      </button>

      {expanded && <div className="result-content">{content}</div>}
    </section>
  );
}

export default App;
