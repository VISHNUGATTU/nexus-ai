import os
import json
import re
import platform
import subprocess
import webbrowser
import pyautogui
import ctypes
import difflib
import json
from typing import Dict, Any, Tuple, Optional
from dotenv import load_dotenv
from google import genai
from core.voice_handler import speak

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


# --- MASTER CAPABILITY REGISTRY ---
# To add a new skill to Nexus, simply add it to this dictionary.
# The AI will dynamically learn it upon the next execution.
NEXUS_TOOLS = {
    "open_url": "Navigate to a website. Target: full URL. (Use this for 'open youtube' -> 'youtube.com').",
    "open_app": "Launch a local application. Target: The exact OS executable command dynamically translated (e.g., 'open Control Panel' -> 'control'). Do not use display names.",
    "chat": "General conversation, math calculations, coding questions, or knowledge NOT requiring a computer action. Target: null. (Provide the actual factual answer in the response field).",
    "play_youtube": "Stream media. Target: search query. (Only if user specifies a song/video to play).",
    "whatsapp_call": "Initiate a voice call. Target: contact name.",
    "whatsapp_message": "Send a text payload. Target: 'ContactName|Message'.",
    "open_local_file": "Locate and launch a document. Target: filename.",
    "send_email": "Transmit an email. Target: 'EmailAddress|Subject|Body'.",
    "system_control": "Hardware/OS control. Target: 'mute', 'volume_up', 'volume_down', 'play_pause', 'lock'.",
    "take_note": "Record information to the Second Brain. Target: note content.",
    "check_stock": "Live financial data. Target: Stock Ticker Symbol (e.g., TSLA).",
    "check_vitals": "Hardware telemetry (CPU, RAM). Target: null.",
    "read_clipboard": "Access OS clipboard buffer. Target: null.",
    "fetch_knowledge": "Encyclopedic facts via Wikipedia. Target: specific topic.",
    "analyze_screen": "Multimodal optical analysis of the monitor. Target: user's question.",
    "web_search": "Live internet scraping for news/weather/data. Target: search query."
}

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
    Dynamically loads capabilities from the NEXUS_TOOLS registry.
    """
    
    # 1. Dynamically build the list of valid actions from our dictionary
    action_list = "\n".join(
        [f"    {i+1}. \"{action}\": {description}" for i, (action, description) in enumerate(NEXUS_TOOLS.items())]
    )

    # 2. Inject the dynamic list into the prompt
    system_prompt: str = f"""
    You are the core intelligence router of the Nexus AI Execution Engine.
    Map the user's command to the correct system action based on the available capabilities.
    
    REQUIREMENT: Return ONLY a raw JSON object. No conversational filler.

    AVAILABLE SYSTEM ACTIONS:
{action_list}

    SCHEMA:
    {{
        "action": "string (MUST exactly match one of the actions listed above)",
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
        
        # Robust JSON Extraction
        import re
        import json
        json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)
        
        if not json_match:
            print(f"[!] Intent Parsing Warning: No valid JSON block found in LLM payload.")
            raise ValueError("JSON block extraction failed.")
            
        parsed_data = json.loads(json_match.group())
        
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
            contact_name = parts[0].strip()
            message_body = parts[1].strip()

            # --- DYNAMIC FUZZY LOGIC ROUTER ---
            try:
                # Load your dynamic external phonebook
                with open("contacts.json", "r") as f:
                    phonebook = json.load(f)
                
                # difflib mathematically compares what you said vs your actual contacts.
                # cutoff=0.4 means it will accept a 40% match (so "bhanu" matches "Bhanu Prakash")
                matches = difflib.get_close_matches(contact_name, phonebook, n=1, cutoff=0.4)
                
                if matches:
                    print(f"[*] Fuzzy Match Found: '{contact_name}' -> '{matches[0]}'")
                    contact_name = matches[0]  # Auto-corrects to the exact spelling
                else:
                    print(f"[!] No fuzzy match found for '{contact_name}'. Attempting raw payload.")
                    
            except FileNotFoundError:
                print("[!] contacts.json not found. Proceeding with raw contact name.")
            # -----------------------------------

            return send_whatsapp_message(contact_name, message_body)
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

            # --- THE "FORCE FOCUS" HACK ---
            # Bypasses Windows Focus Stealing Prevention so apps open in the foreground
            if os_name == "Windows":
                try:
                    # 1. Tap the 'alt' key to register fake hardware input with the OS
                    import pyautogui
                    import ctypes
                    pyautogui.press('alt')
                    # 2. Tell the OS kernel to allow the next launched process to take the foreground
                    ctypes.windll.user32.AllowSetForegroundWindow(-1)
                except Exception:
                    pass

            try:
                # 1. Native OS Execution
                if os_name == "Windows":
                    if "whatsapp" in target_lower: 
                        os.startfile("whatsapp://")
                    elif "spotify" in target_lower: 
                        os.startfile("spotify:")
                    else:
                        os.startfile(target)

                elif os_name == "Darwin": # macOS
                    import subprocess
                    subprocess.run(["open", "-a", target], check=True, stderr=subprocess.DEVNULL)
                elif os_name == "Linux":
                    import subprocess
                    subprocess.Popen([target], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

                return True, f"Execution protocol initiated for '{target}'."

            except Exception:
                # 2. SMART FALLBACK: Web Routing
                print(f"[*] Local app '{target}' not found. Engaging Web Fallback...")

                search_query = target.replace(' ', '+')
                fallback_url = f"https://duckduckgo.com/?q=!ducky+{search_query}"
                
                import webbrowser
                # Re-apply the focus hack right before the browser opens
                if os_name == "Windows":
                    try:
                        pyautogui.press('alt')
                    except:
                        pass
                webbrowser.open(fallback_url)
                return True, f"Local app not found. Routing '{target}' to the web."
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