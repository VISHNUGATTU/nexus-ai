import os
import time
import platform
import subprocess
from typing import Tuple

# Safely handle the GUI automation library import
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
    # FAILSAFE: Moving the mouse to any of the 4 screen corners aborts the script instantly.
    pyautogui.FAILSAFE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False

# --- SYSTEM TIMING CONFIGURATION ---
# Extracted for easy tuning based on the host machine's hardware speed
APP_LOAD_DELAY: float = 5.0      # Seconds to wait for WhatsApp to boot
SEARCH_DELAY: float = 2.0        # Seconds to wait for search results to populate
UI_INTERACTION_DELAY: float = 1.0  # Seconds between keystrokes

def _open_whatsapp_and_find_contact(contact_name: str) -> str:
    """
    Private helper function to securely launch WhatsApp across different operating systems 
    and navigate to a specific contact's chat.
    
    Returns:
        str: The OS-specific keyboard modifier ('ctrl' or 'command').
    """
    if not PYAUTOGUI_AVAILABLE:
        raise ImportError("Missing required library: 'pyautogui'. Please run: pip install pyautogui")

    if not contact_name or not contact_name.strip():
        raise ValueError("Target contact name cannot be empty.")

    clean_contact: str = contact_name.strip()
    system_os: str = platform.system()
    
    # 1. OS-Agnostic Application Launch via Protocol Handlers
    if system_os == "Windows":
        os.startfile("whatsapp://")
    elif system_os == "Darwin":  # macOS
        subprocess.run(["open", "whatsapp://"], check=True)
    elif system_os == "Linux":
        subprocess.run(["xdg-open", "whatsapp://"], check=True)
    else:
        raise OSError(f"Unsupported operating system for GUI automation: {system_os}")
        
    time.sleep(APP_LOAD_DELAY)

    # 2. Determine OS Keyboard Modifiers
    modifier: str = 'command' if system_os == 'Darwin' else 'ctrl'

    # 3. Trigger Native Search
    pyautogui.hotkey(modifier, 'f')
    time.sleep(UI_INTERACTION_DELAY)
    
    # 4. Safely input text
    pyautogui.write(clean_contact, interval=0.05)
    time.sleep(SEARCH_DELAY)
    
    # 5. Lock onto target chat
    pyautogui.press('enter')
    time.sleep(UI_INTERACTION_DELAY)
    
    return modifier

def make_whatsapp_call(contact_name: str) -> Tuple[bool, str]:
    """
    Automates the process of opening WhatsApp, locating a contact, and initiating a voice call.
    """
    print(f"[*] Automation Engine: Initiating voice protocol for '{contact_name}'...")
    
    try:
        modifier: str = _open_whatsapp_and_find_contact(contact_name)
        
        # Initiate the voice call (Default shortcuts: Ctrl/Cmd + Shift + A)
        print(f"[*] Executing voice call macro...")
        pyautogui.hotkey(modifier, 'shift', 'a')
        
        return True, f"Successfully initiated WhatsApp call to {contact_name}."

    except ImportError as ie:
        return False, str(ie)
    except ValueError as ve:
        return False, f"Input Error: {str(ve)}"
    except pyautogui.FailSafeException:
        print("[!] SECURITY OVERRIDE: Failsafe triggered. Automation aborted.")
        return False, "Automation manually aborted via mouse failsafe."
    except Exception as e:
        print(f"[X] Execution Engine Error: {str(e)}")
        return False, f"Failed to automate WhatsApp call. Error: {str(e)}"

def send_whatsapp_message(contact_name: str, message_text: str) -> Tuple[bool, str]:
    """
    Automates the process of opening WhatsApp, locating a contact, and transmitting a text payload.
    """
    print(f"[*] Automation Engine: Prepping transmission to '{contact_name}'...")
    
    if not message_text or not message_text.strip():
        return False, "Cannot send an empty message payload."
        
    try:
        _open_whatsapp_and_find_contact(contact_name)
        
        # Transmit the payload
        print("[*] Injecting text payload...")
        pyautogui.write(message_text.strip(), interval=0.02)
        time.sleep(0.5)
        pyautogui.press('enter')
        
        return True, f"Successfully transmitted WhatsApp message to {contact_name}."

    except ImportError as ie:
        return False, str(ie)
    except ValueError as ve:
        return False, f"Input Error: {str(ve)}"
    except pyautogui.FailSafeException:
        print("[!] SECURITY OVERRIDE: Failsafe triggered. Automation aborted.")
        return False, "Automation manually aborted via mouse failsafe."
    except Exception as e:
        print(f"[X] Execution Engine Error: {str(e)}")
        return False, f"Failed to transmit WhatsApp message. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    success, msg = send_whatsapp_message("Mom", "System diagnostic: Automation engine is running at peak capacity.")
    print(msg)