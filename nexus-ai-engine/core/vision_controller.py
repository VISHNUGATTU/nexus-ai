import os
import io
from typing import Tuple, Dict, Any
from dotenv import load_dotenv

# Safely handle the GUI automation dependency and Google AI SDK
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE: bool = True
except ImportError:
    PYAUTOGUI_AVAILABLE: bool = False

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE: bool = True
except ImportError:
    GENAI_AVAILABLE: bool = False

# Boot-level operations: Load environment variables once into memory
load_dotenv()

# --- SYSTEM CONFIGURATION ---
VISION_MODEL_VERSION: str = 'gemini-2.5-flash'
IMAGE_FORMAT: str = 'PNG'
MIME_TYPE: str = 'image/png'

def analyze_screen(user_question: str) -> Tuple[bool, str]:
    """
    Captures a high-resolution snapshot of the primary display, optimizes the binary payload,
    and transmits it to the multimodal vision engine for contextual analysis.
    
    Args:
        user_question (str): The specific question or directive regarding the screen content.
        
    Returns:
        Tuple[bool, str]: Success status and the AI's visual analysis report.
    """
    if not user_question or not str(user_question).strip():
        return False, "Cannot analyze the screen without a specific question or directive."

    clean_question: str = str(user_question).strip()
    print(f"[*] Vision Controller: Initializing optical capture sequence...")

    # 1. Dependency & API Validation
    if not PYAUTOGUI_AVAILABLE or not GENAI_AVAILABLE:
        print("[!] Dependency Error: 'pyautogui' or 'google-generativeai' not installed.")
        return False, "Missing required system dependencies. Run 'pip install pyautogui google-generativeai'."

    api_key: str | None = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[X] Auth Error: GEMINI_API_KEY missing from environment.")
        return False, "CRITICAL: 'GEMINI_API_KEY' is missing from your .env file."

    try:
        # Configure API Client
        client = genai.Client(api_key=api_key)
        
        # 2. Optical Capture (Primary Display)
        try:
            screenshot = pyautogui.screenshot()
        except OSError as oe:
            print(f"[X] OS Permission Error: {str(oe)}")
            return False, "Failed to capture screen. If you are on macOS, ensure your terminal/IDE has 'Screen Recording' permissions in System Settings."

        # 3. Payload Compression & Memory Management
        # Compress the raw bitmap into an optimized PNG byte stream to slash network latency
        img_byte_arr = io.BytesIO()
        screenshot.save(img_byte_arr, format=IMAGE_FORMAT, optimize=True)
        binary_payload: bytes = img_byte_arr.getvalue()
        
        print("[*] Screen captured and payload optimized. Transmitting to Vision AI...")
        
        # Inject structural context to prevent the AI from hallucinating or reading its own UI
        engineered_prompt: str = (
            "SYSTEM DIRECTIVE: You are an advanced AI assistant analyzing the user's primary computer monitor. "
            "Ignore any overlays or terminal windows belonging to the AI assistant itself. "
            "Focus strictly on the underlying applications, code, or data visible. "
            f"USER DIRECTIVE: {clean_question}"
        )
        
        # Format the binary data for the Gemini SDK
        vision_packet = types.Part.from_bytes(
            data=binary_payload,
            mime_type=MIME_TYPE
        )
        
        # 5. Multimodal Transmission
        response = client.models.generate_content(
            model=VISION_MODEL_VERSION,
            contents=[engineered_prompt, vision_packet]
        )
        
        if not response or not response.text:
            print("[X] Vision Controller: Received empty payload from Google servers.")
            return False, "The vision model processed the image but returned an empty response."

        print("[✓] Vision Controller: Optical analysis complete.")
        return True, response.text
        
    except Exception as e:
        error_msg: str = str(e).lower()
        print(f"[X] Critical Vision Failure: {error_msg}")
        
        # Granular API Error Handling
        if "404" in error_msg or "not found" in error_msg:
            return False, f"Model '{VISION_MODEL_VERSION}' not found or access denied by API key."
        if "403" in error_msg or "permission" in error_msg:
            return False, "API Key rejected. Please verify your GEMINI_API_KEY."
        if "quota" in error_msg or "429" in error_msg:
            return False, "Google API quota exceeded. Please check your billing/usage limits."
            
        return False, f"An unexpected system error occurred during screen analysis. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the optical capture and transmission pipeline independently
    success, msg = analyze_screen("Provide a concise, 2-sentence summary of the active application on this screen.")
    print(msg)