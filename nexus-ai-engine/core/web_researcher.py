import os
from typing import Tuple, List, Dict, Any
from dotenv import load_dotenv
import time
import random

# -------------------------------
# 🔌 DEPENDENCIES
# -------------------------------
try:
    from ddgs import DDGS
    DDGS_AVAILABLE: bool = True
except ImportError:
    DDGS_AVAILABLE: bool = False

try:
    from google import genai
    GENAI_AVAILABLE: bool = True
except ImportError:
    GENAI_AVAILABLE: bool = False

# -------------------------------
# ⚙️ CONFIG
# -------------------------------
load_dotenv()

SYNTHESIS_MODEL: str = "gemini-2.5-flash"
MAX_NEWS_RESULTS: int = 8
MAX_TEXT_RESULTS: int = 5
SEARCH_REGION: str = "in-en"

RETRY_ATTEMPTS: int = 3
BASE_DELAY: float = 1.5


# -------------------------------
# 🛠️ UTILITIES
# -------------------------------
def _init_ddgs():
    """Version-safe DDGS initialization"""
    try:
        return DDGS(headers={"User-Agent": "Mozilla/5.0"})
    except TypeError:
        return DDGS()


def _sleep():
    time.sleep(BASE_DELAY + random.uniform(0.5, 1.5))


def _is_news_query(q: str) -> bool:
    return any(k in q for k in ["news", "headline", "latest", "update"])


def _optimize_query(query: str) -> str:
    """Force better sources for tech news"""
    if "news" in query.lower():
        return f"{query} site:techcrunch.com OR site:theverge.com OR site:wired.com"
    return query


# -------------------------------
# 🔍 FILTER + RANK
# -------------------------------
def _is_valid(title: str, body: str) -> bool:
    title_l = title.lower()

    if len(title_l) < 15:
        return False

    if "black hat" in title_l:
        return False

    if "sale" in title_l or "deal" in title_l:
        return False

    return True


def _score(title: str) -> int:
    score = 0
    keywords = [
        "ai", "openai", "google", "microsoft",
        "nvidia", "tesla", "chip", "startup", "tech"
    ]

    for k in keywords:
        if k in title.lower():
            score += 2

    if len(title) > 40:
        score += 1

    return score


# -------------------------------
# 🔍 SEARCH
# -------------------------------
def _fetch(ddgs, query: str, ql: str):
    _sleep()

    # NEWS first
    if _is_news_query(ql):
        try:
            print("[SEARCH] NEWS...")
            res = list(ddgs.news(query, region=SEARCH_REGION, max_results=MAX_NEWS_RESULTS))
            if res:
                return res
        except Exception as e:
            print("[WARN] News failed:", e)

    # TEXT fallback
    try:
        print("[SEARCH] TEXT fallback...")
        return list(ddgs.text(query, region=SEARCH_REGION, max_results=MAX_TEXT_RESULTS))
    except Exception as e:
        print("[ERROR] Text failed:", e)

    return []


def _safe_search(ddgs, query: str, ql: str):
    for i in range(RETRY_ATTEMPTS):
        res = _fetch(ddgs, query, ql)
        if res:
            return res
        time.sleep(BASE_DELAY * (2 ** i))
    return []


# -------------------------------
# 🧠 LLM
# -------------------------------
def _synthesize(query: str, context: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Missing GEMINI_API_KEY")

    client = genai.Client(api_key=api_key)

    prompt = (
        "SYSTEM: You are a tech news analyst.\n"
        "Return top 5 clean tech headlines.\n\n"
        "Rules:\n"
        "- No meta text\n"
        "- No hallucination\n"
        "- Short bullet points\n\n"
        f"QUERY:\n{query}\n\n"
        f"DATA:\n{context}"
    )

    res = client.models.generate_content(
        model=SYNTHESIS_MODEL,
        contents=prompt
    )

    if not res or not res.text:
        raise RuntimeError("Empty LLM response")

    return res.text


# -------------------------------
# 🚀 MAIN
# -------------------------------
def perform_web_search(query: str) -> Tuple[bool, str]:

    if not query or not query.strip():
        return False, "Empty query"

    query = _optimize_query(query.strip())
    ql = query.lower()

    print("[INIT]", query)

    if not DDGS_AVAILABLE:
        return False, "Install ddgs"

    if not GENAI_AVAILABLE:
        return False, "Install google-genai"

    try:
        ddgs = _init_ddgs()

        with ddgs:
            results = _safe_search(ddgs, query, ql)

        if not results:
            return False, "No results found"

        # FILTER
        clean = []
        for r in results:
            title = r.get("title", "")
            body = r.get("body") or r.get("snippet", "")

            if not _is_valid(title, body):
                continue

            clean.append(r)

        if not clean:
            return False, "No high-quality results"

        # RANK
        clean.sort(key=lambda x: _score(x.get("title", "")), reverse=True)
        clean = clean[:5]

        # CONTEXT
        context = ""
        for i, r in enumerate(clean):
            context += (
                f"--- {i+1} ---\n"
                f"{r.get('title')}\n"
                f"{r.get('body') or r.get('snippet','')}\n\n"
            )

        if len(context) < 100:
            return False, "Weak data"

        print("[INFO] Synthesizing...")

        output = _synthesize(query, context)

        return True, output

    except Exception as e:
        msg = str(e).lower()

        if "403" in msg or "ratelimit" in msg:
            return False, "Rate limit hit"

        if "api key" in msg:
            return False, "Invalid Gemini key"

        return False, f"Error: {str(e)}"


# -------------------------------
# 🧪 TEST
# -------------------------------
if __name__ == "__main__":
    ok, res = perform_web_search("top tech news headlines today")
    print("\n--- RESULT ---\n")
    print(res if ok else f"ERROR: {res}")