import urllib.parse
import webbrowser
from typing import Tuple

# Safely handle the heavy media automation library at boot time
try:
    import pywhatkit
    PYWHATKIT_AVAILABLE: bool = True
except ImportError:
    PYWHATKIT_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
YOUTUBE_SEARCH_BASE_URL: str = "https://www.youtube.com/results"

def play_youtube_video(search_query: str) -> Tuple[bool, str]:
    """
    Takes a natural language search query, locates the best match on YouTube,
    and automatically initiates playback. Features a zero-dependency fallback mechanism.
    
    Args:
        search_query (str): The video title or topic to search for.
        
    Returns:
        Tuple[bool, str]: Success status and execution report.
    """
    if not search_query or not str(search_query).strip():
        print("[X] Media Controller Error: Empty search query provided.")
        return False, "Cannot play a video without a valid search query."
        
    clean_query: str = str(search_query).strip()
    print(f"[*] Media Controller: Initiating YouTube playback protocol for '{clean_query}'...")
    
    try:
        # 1. Primary Execution Vector: Direct Auto-Play via pywhatkit
        if PYWHATKIT_AVAILABLE:
            print("[*] Dependency 'pywhatkit' detected. Executing direct auto-play...")
            # playonyt opens the browser and automatically clicks the top search result
            pywhatkit.playonyt(clean_query)
            
            print(f"[✓] Media Controller: Auto-play triggered successfully.")
            return True, f"Successfully initiated playback for '{clean_query}' on YouTube."
            
        # 2. Fallback Execution Vector: Native Browser Routing
        else:
            print("[!] Dependency 'pywhatkit' absent. Engaging native browser fallback.")
            
            # Safely encode the payload for HTTP transmission (handles spaces/special chars)
            query_string: str = urllib.parse.urlencode({"search_query": clean_query})
            youtube_url: str = f"{YOUTUBE_SEARCH_BASE_URL}?{query_string}"
            
            print(f"[*] Dispatching URL payload to default OS browser...")
            webbrowser.open(youtube_url)
            
            print(f"[✓] Media Controller: Browser routing successful.")
            return True, f"I have opened the YouTube search results for: {clean_query}"
            
    except webbrowser.Error as we:
        print(f"[X] OS Browser Error: {str(we)}")
        return False, "Failed to launch the system's default web browser. Please check your OS defaults."
    except Exception as e:
        print(f"[X] Critical Media Failure: {str(e)}")
        return False, f"An unexpected error occurred during media execution. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the module independently to verify routing and execution
    success, msg = play_youtube_video("Interstellar main theme")
    print(msg)