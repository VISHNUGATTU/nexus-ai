import platform
import subprocess
from typing import Tuple, Set

# Safely handle the GUI automation dependency at boot
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE: bool = True
except ImportError:
    PYAUTOGUI_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
# O(1) Lookup Table for strict input validation
VALID_COMMANDS: Set[str] = {"mute", "volume_up", "volume_down", "play_pause", "lock"}
VOLUME_STEP_COUNT: int = 5  # Number of keystrokes to simulate per volume command

def execute_system_command(command_type: str) -> Tuple[bool, str]:
    """
    Executes core OS-level commands for media playback and session security.
    Implements strict payload validation and cross-platform execution vectors.
    
    Args:
        command_type (str): The specific hardware command to execute.
        
    Returns:
        Tuple[bool, str]: Success status and the execution report.
    """
    if not command_type or not str(command_type).strip():
        return False, "Received an empty system command payload."
        
    clean_command: str = str(command_type).strip().lower()
    
    # 1. Payload Validation (Security Buffer)
    if clean_command not in VALID_COMMANDS:
        print(f"[X] Security Violation: Unrecognized system command '{clean_command}'")
        return False, f"Command '{clean_command}' is not whitelisted in the system controller."

    print(f"[*] Hardware Controller: Dispatching OS command -> '{clean_command}'...")

    try:
        os_name: str = platform.system()
        
        # --- MEDIA CONTROLS (Requires pyautogui) ---
        if clean_command in {"mute", "volume_up", "volume_down", "play_pause"}:
            if not PYAUTOGUI_AVAILABLE:
                print("[!] Dependency Error: 'pyautogui' not installed.")
                return False, "Missing required hardware dependency: 'pyautogui'. Run 'pip install pyautogui'."
                
            if clean_command == "mute":
                pyautogui.press("volumemute")
                return True, "System volume state toggled."
                
            elif clean_command == "volume_up":
                for _ in range(VOLUME_STEP_COUNT): 
                    pyautogui.press("volumeup")
                return True, "System volume increased."
                
            elif clean_command == "volume_down":
                for _ in range(VOLUME_STEP_COUNT): 
                    pyautogui.press("volumedown")
                return True, "System volume decreased."
                
            elif clean_command == "play_pause":
                pyautogui.press("playpause")
                return True, "Media playback state toggled."

        # --- SESSION SECURITY CONTROLS (OS-Native) ---
        elif clean_command == "lock":
            print(f"[*] Hardware Controller: Initiating OS session lock for {os_name}...")
            
            if os_name == "Windows":
                # Direct Windows NT API call via rundll32
                subprocess.run(["rundll32.exe", "user32.dll,LockWorkStation"], check=True)
                return True, "Windows workstation secured and locked."
                
            elif os_name == "Darwin":  # macOS
                # Initiates immediate display sleep (locks if security settings require password on wake)
                subprocess.run(["pmset", "displaysleepnow"], check=True)
                return True, "macOS session secured."
                
            elif os_name == "Linux":
                # Primary execution vector for Linux desktop environments
                try:
                    subprocess.run(["xdg-screensaver", "lock"], check=True)
                except FileNotFoundError:
                    # Fallback execution vector for GNOME
                    subprocess.run(["gnome-screensaver-command", "-l"], check=True)
                return True, "Linux session secured."
                
            else:
                return False, f"Hardware lock command is not supported on unrecognized OS: {os_name}."

    except subprocess.CalledProcessError as cpe:
        print(f"[X] OS Subprocess Failure: {str(cpe)}")
        return False, f"The operating system rejected the command execution. Error: {str(cpe)}"
    except Exception as e:
        print(f"[X] Critical Hardware Controller Failure: {str(e)}")
        return False, f"An unexpected system error occurred during execution. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the module with a benign command to verify OS integration
    success, msg = execute_system_command("mute")
    print(msg)