import os
import json
import re
import platform
import subprocess
import webbrowser
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from google import genai

# --- CORE MODULE IMPORTS ---
from core.media_controller import play_youtube_video
from core.file_locator import open_local_file
from core.automation_tools import make_whatsapp_call, send_whatsapp_message
from core.email_controller import send_email_background
from core.system_controller import execute_system_command
from core.note_taker import append_to_notes
from core.market_controller import fetch_stock_price
from core.vitals_controller import get_system_vitals
from core.clipboard_controller import read_clipboard_data
from core.knowledge_controller import fetch_wikipedia_summary
from core.vision_controller import analyze_screen
from core.web_researcher import perform_web_search

# --- SYSTEM BOOT & VALIDATION ---
load_dotenv()
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("CRITICAL BOOT FAILURE: GEMINI_API_KEY not found in environment variables.")

ai_client = genai.Client(api_key=GEMINI_API_KEY)
INTENT_MODEL_VERSION = 'gemini-2.5-flash'

def parse_intent(prompt: str) -> Dict[str, Any]:
    """
    Acts as the Intelligence Layer. Translates natural language into structured system execution schemas.
    Utilizes Regex extraction to guarantee JSON compliance.
    
    Args:
        prompt (str): The raw user command.
        
    Returns:
        Dict[str, Any]: A parsed dictionary containing the action, target, and AI response.
    """
    system_prompt: str = f"""
    You are the core intelligence router of the Nexus AI Execution Engine.
    Map the user's command to the correct system action.
    
    REQUIREMENT: Return ONLY a raw JSON object. No conversational filler.

    VALID ACTIONS:
    1. "open_url": Navigate to a website. Target: full URL.
    2. "open_app": Launch a local application. Target: app name.
    3. "chat": General conversation or queries not requiring system actions. Target: null.
    4. "play_youtube": Stream media. Target: search query.
    5. "whatsapp_call": Initiate a voice call. Target: contact name.
    6. "whatsapp_message": Send a text payload. Target: "ContactName|Message".
    7. "open_local_file": Locate and launch a document. Target: filename.
    8. "send_email": Transmit an email. Target: "EmailAddress|Subject|Body".
    9. "system_control": Hardware/OS control. Target: "mute", "volume_up", "volume_down", "play_pause", "lock".
    10. "take_note": Record information to the Second Brain. Target: note content.
    11. "check_stock": Live financial data. Target: Stock Ticker Symbol (e.g., TSLA).
    12. "check_vitals": Hardware telemetry (CPU, RAM). Target: null.
    13. "read_clipboard": Access OS clipboard buffer. Target: null.
    14. "fetch_knowledge": Encyclopedic facts via Wikipedia. Target: specific topic.
    15. "analyze_screen": Multimodal optical analysis of the monitor. Target: the user's question.
    16. "web_search": Live internet scraping for news/weather/data. Target: search query.

    SCHEMA:
    {{
        "action": "string",
        "target": "string" | null,
        "response": "short conversational confirmation"
    }}

    USER COMMAND: "{prompt}"
    """
    
    try:
        response = ai_client.models.generate_content(
            model=INTENT_MODEL_VERSION,
            contents=system_prompt
        )
        raw_text: str = response.text.strip()
        
        # Robust JSON Extraction: Mathematically isolate the JSON payload 
        # even if the LLM hallucinates markdown ticks or conversational text
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        if not json_match:
            print(f"[!] Intent Parsing Warning: No valid JSON block found in LLM payload.")
            raise ValueError("JSON block extraction failed.")
            
        parsed_data: Dict[str, Any] = json.loads(json_match.group())
        
        if "action" not in parsed_data or "response" not in parsed_data:
            raise KeyError("Payload missing required routing keys.")
            
        return parsed_data
        
    except Exception as e:
        print(f"[X] Intelligence Layer Error: {str(e)}")
        # Failsafe routing ensures the engine never crashes the UI on bad LLM outputs
        return {
            "action": "chat",
            "target": None,
            "response": "I encountered an anomaly while processing your command intent. Let's try that again."
        }

def execute_action(action: str, target: Optional[str]) -> Tuple[bool, Optional[str]]:
    """
    The Master Router. Directs validated intents to the appropriate local controller modules.
    
    Args:
        action (str): The specific system execution command.
        target (str | None): The payload required for the action.
        
    Returns:
        Tuple[bool, str | None]: Success status and the operational output.
    """
    print(f"[*] Execution Engine -> Action: '{action}' | Target: '{target}'")

    try:
        # --- 1. WEB & DATA RETRIEVAL ---
        if action == "web_search":
            return perform_web_search(target)
        elif action == "fetch_knowledge":
            return fetch_wikipedia_summary(target)
        elif action == "check_stock":
            return fetch_stock_price(target)
        elif action == "open_url":
            if not target: return False, "Target URL missing."
            url = target if target.startswith("http") else f"https://{target}"
            webbrowser.open(url)
            return True, f"Navigating to {url}"

        # --- 2. COMMUNICATIONS & AUTOMATION ---
        elif action == "whatsapp_message":
            if not target or "|" not in target: return False, "Invalid WhatsApp payload format."
            parts = target.split("|", 1)
            return send_whatsapp_message(parts[0].strip(), parts[1].strip())
        elif action == "whatsapp_call":
            return make_whatsapp_call(target)
        elif action == "send_email":
            if not target or target.count("|") < 2: return False, "Invalid Email payload format."
            parts = target.split("|", 2)
            return send_email_background(parts[0].strip(), parts[1].strip(), parts[2].strip())

        # --- 3. HARDWARE & LOCAL SYSTEM ---
        elif action == "system_control":
            return execute_system_command(target)
        elif action == "check_vitals":
            return get_system_vitals()
        elif action == "read_clipboard":
            return read_clipboard_data()
        elif action == "analyze_screen":
            return analyze_screen(target)
        elif action == "open_local_file":
            return open_local_file(target)
        elif action == "open_app":
            if not target: return False, "Target application name missing."
            os_name: str = platform.system()
            target_lower: str = target.lower().strip()
            try:
                # Protocol handling for modern apps
                if os_name == "Windows":
                    if "whatsapp" in target_lower: os.startfile("whatsapp://")
                    elif "spotify" in target_lower: os.startfile("spotify:")
                    else: subprocess.run(["cmd", "/c", "start", "", target], check=True)
                elif os_name == "Darwin":
                    subprocess.run(["open", "-a", target], check=True)
                elif os_name == "Linux":
                    subprocess.Popen([target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return True, f"Execution protocol initiated for '{target}'."
            except Exception:
                try:
                    os.startfile(target)
                    return True, f"Launched '{target}' via OS shell handler."
                except Exception:
                    return False, f"The system could not locate the application '{target}'."

        # --- 4. PRODUCTIVITY & MEDIA ---
        elif action == "take_note":
            return append_to_notes(target)
        elif action == "play_youtube":
            return play_youtube_video(target)

        # --- 5. CONVERSATION ---
        elif action == "chat":
            return True, None

        # --- UNKNOWN ROUTE ---
        return False, f"CRITICAL: Unrecognized execution route '{action}'."

    except Exception as e:
        print(f"[X] Master Execution Failure: {str(e)}")
        return False, f"The task failed during execution. Error: {str(e)}"