from typing import Tuple, List

# Safely handle external API dependencies
try:
    import wikipedia
    import requests
    WIKIPEDIA_AVAILABLE: bool = True
except ImportError:
    WIKIPEDIA_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
SENTENCE_LIMIT: int = 3
DEFAULT_LANGUAGE: str = "en"  # e.g., 'hi' for Hindi, 'es' for Spanish, 'fr' for French

def fetch_wikipedia_summary(query: str, sentences: int = SENTENCE_LIMIT) -> Tuple[bool, str]:
    """
    Silently pings Wikipedia's API to fetch a concise, encyclopedic summary of a topic.
    Enforces strict search routing to bypass the library's unstable auto-suggest feature.
    
    Args:
        query (str): The natural language topic to search for.
        sentences (int): Maximum number of sentences to extract for the summary.
        
    Returns:
        Tuple[bool, str]: Success status and the factual payload or error message.
    """
    if not query or not query.strip():
        return False, "Cannot fetch knowledge for an empty query."
        
    clean_query: str = query.strip()
    print(f"[*] Knowledge Controller: Initializing data retrieval for '{clean_query}'...")
    
    if not WIKIPEDIA_AVAILABLE:
        print("[!] Dependency Error: 'wikipedia' or 'requests' not installed.")
        return False, "Missing required system dependencies. Run: 'pip install wikipedia requests'"
        
    try:
        # 1. Enforce predictable localization
        wikipedia.set_lang(DEFAULT_LANGUAGE)
        
        # 2. Search for exact indexing paths
        search_results: List[str] = wikipedia.search(clean_query)
        
        if not search_results:
            print(f"[X] Knowledge Miss: No indexing found for '{clean_query}'.")
            return False, f"Could not locate any factual records matching '{clean_query}'."
            
        # Lock onto the highest probability match
        best_match: str = search_results[0]
        print(f"[*] Match Acquired: '{best_match}'. Fetching summary payload...")
        
        # 3. Data Extraction (auto_suggest=False prevents secondary routing crashes)
        summary: str = wikipedia.summary(best_match, sentences=sentences, auto_suggest=False)
        
        print(f"[✓] Knowledge Controller: Factual payload retrieved for '{best_match}'.")
        return True, f"Here is the encyclopedic summary for {best_match}:\n\n{summary}"
        
    except wikipedia.exceptions.DisambiguationError as de:
        # Clean the returned options to remove blank data or self-references
        raw_options: List[str] = de.options
        clean_options: List[str] = [opt for opt in raw_options if opt and opt.lower() != clean_query.lower()]
        
        # Limit to top 5 for readability
        options_str: str = ", ".join(clean_options[:5])
        
        print(f"[X] Ambiguity Error: Multiple entities found for '{clean_query}'.")
        return False, f"The term '{clean_query}' refers to multiple different topics. Did you mean one of these: {options_str}?"
        
    except wikipedia.exceptions.PageError:
        print(f"[X] Knowledge Error: Indexing lost for '{best_match}'.")
        return False, f"The specific record for '{best_match}' could not be loaded. It may have been moved or deleted."
        
    except requests.exceptions.RequestException as re:
        print(f"[X] Network Timeout/Error: {str(re)}")
        return False, "Failed to connect to Wikipedia's servers. Please check your internet connection."
        
    except Exception as e:
        print(f"[X] Critical Knowledge Failure: {str(e)}")
        return False, f"An unexpected system error occurred while fetching data. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the module with an exact query
    success, msg = fetch_wikipedia_summary("2023 IPL final")
    print(msg)