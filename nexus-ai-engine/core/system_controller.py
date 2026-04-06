import platform
import subprocess
from typing import Tuple, Set
import os

# Safely handle the GUI automation dependency at boot
try:
    import pyautogui
    PYAUTOGUI_AVAILABLE: bool = True
except ImportError:
    PYAUTOGUI_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
# O(1) Lookup Table for strict input validation
VALID_COMMANDS: Set[str] = {
    "mute", "volume_up", "volume_down", 
    "play_pause", "lock", "toggle_backlight", "check_updates", "list_apps", "search_app"
}
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
        
    raw_command = str(command_type).strip()
    
    # --- NEW: PAYLOAD PARSER ---
    # Separates the command from the specific target (e.g., "search_app|Valorant")
    if "|" in raw_command:
        clean_command, payload = raw_command.split("|", 1)
        clean_command = clean_command.lower().strip()
        payload = payload.strip()
    else:
        clean_command = raw_command.lower()
        payload = None
        
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
        # --- TARGETED SYSTEM SEARCH ---
        elif clean_command == "search_app":
            if not payload:
                return False, "Application name missing. Please specify an app to search for."
                
            print(f"[*] Hardware Controller: Searching installed applications for '{payload}'...")
            
            if os_name == "Windows":
                # Run the same fast PowerShell scan
                result = subprocess.run(
                    ["powershell", "-Command", "Get-StartApps | Select-Object -ExpandProperty Name"], 
                    capture_output=True, text=True, check=True
                )
                
                apps = [app.strip() for app in result.stdout.split('\n') if app.strip()]
                
                # Filter the massive list down to anything that matches your target
                matches = [app for app in apps if payload.lower() in app.lower()]
                
                if matches:
                    summary = ", ".join(matches)
                    return True, f"Yes, I found {len(matches)} matching applications installed: {summary}."
                else:
                    return True, f"I scanned the system, but I could not find any installed application named '{payload}'."
        # --- SYSTEM DIAGNOSTICS ---
        elif clean_command == "list_apps":
            print(f"[*] Hardware Controller: Scanning installed applications on {os_name}...")
            
            if os_name == "Windows":
                # Uses a native PowerShell command to fetch all user-facing Start Menu apps
                # This is much safer and faster than digging through the Windows Registry
                result = subprocess.run(
                    ["powershell", "-Command", "Get-StartApps | Select-Object -ExpandProperty Name"], 
                    capture_output=True, 
                    text=True,
                    check=True
                )
                
                # Clean up the output, remove empty lines, and deduplicate
                apps = [app.strip() for app in result.stdout.split('\n') if app.strip()]
                apps = sorted(list(set(apps)))
                
                if not apps:
                    return False, "I queried the system, but could not retrieve the application list."
                
                # CRITICAL LIMITER: A typical PC has 150+ apps installed. 
                # If we return all of them, the TTS engine will speak for 10 minutes straight.
                # We limit the spoken response to a summary of the first 15, but you can 
                # log the full list to the terminal or a file if needed.
                total_apps = len(apps)
                summary = ", ".join(apps[:15])
                
                print(f"[✓] Successfully mapped {total_apps} system applications.")
                return True, f"I scanned the system and found {total_apps} applications. Here are a few of them: {summary}."

            elif os_name == "Darwin": # macOS
                result = subprocess.run(["ls", "/Applications"], capture_output=True, text=True)
                apps = [app.replace(".app", "") for app in result.stdout.split('\n') if app]
                summary = ", ".join(apps[:15])
                return True, f"I found {len(apps)} apps in the Applications folder, including: {summary}."

            elif os_name == "Linux":
                result = subprocess.run(["ls", "/usr/share/applications"], capture_output=True, text=True)
                apps = [app.replace(".desktop", "") for app in result.stdout.split('\n') if app]
                summary = ", ".join(apps[:15])
                return True, f"I found {len(apps)} desktop applications, including: {summary}."
        # --- SYSTEM MAINTENANCE CONTROLS ---
        elif clean_command == "check_updates":
            print(f"[*] Hardware Controller: Initiating OS Update Sequence for {os_name}...")
            
            if os_name == "Windows":
                import time
                # 1. Pop open the visual UI so you can watch it happen
                os.startfile("ms-settings:windowsupdate")
                
                # 2. Give the UI 1.5 seconds to load on screen
                time.sleep(1.5)
                
                # 3. Fire the hidden internal command to force the scan
                # 'StartInteractiveScan' tells the OS to check right now and show the results in the UI
                subprocess.run(["usoclient", "StartInteractiveScan"], check=False)
                
                return True, "Initiated Windows Update sequence. Scanning Microsoft servers now."
                
            elif os_name == "Darwin": # macOS
                subprocess.run(["open", "x-apple.systempreferences:com.apple.preferences.softwareupdate"], check=False)
                return True, "Opened macOS Software Update."
                
            elif os_name == "Linux":
                # For Linux, we just pop open a new terminal running apt update
                subprocess.Popen(["x-terminal-emulator", "-e", "sudo apt update && echo 'Update check complete. Press Enter to close.' && read"], stdout=subprocess.DEVNULL)
                return True, "Initiated Linux package manager update sequence."
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