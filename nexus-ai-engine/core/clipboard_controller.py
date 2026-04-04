from typing import Tuple

# Safely handle the OS clipboard library import
try:
    import pyperclip
    PYPERCLIP_AVAILABLE: bool = True
except ImportError:
    PYPERCLIP_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
# The maximum number of characters to pull before truncating.
# Protects the frontend UI from freezing and LLM from token-limit exhaustion.
MAX_CLIPBOARD_LENGTH: int = 2000  

def read_clipboard_data(max_length: int = MAX_CLIPBOARD_LENGTH) -> Tuple[bool, str]:
    """
    Silently accesses the OS clipboard to retrieve copied text payloads.
    Includes safeguards against missing dependencies, non-text data, and massive payloads.
    
    Args:
        max_length (int): Maximum string length to return before applying truncation.
        
    Returns:
        Tuple[bool, str]: Success status and the clipboard payload or error message.
    """
    print("[*] I/O Controller: Accessing system clipboard buffer...")
    
    if not PYPERCLIP_AVAILABLE:
        print("[!] Dependency Error: 'pyperclip' not installed.")
        return False, "Missing required system dependency: 'pyperclip'. Run 'pip install pyperclip'."
    
    try:
        # Intercept the raw OS clipboard payload
        content = pyperclip.paste()
        
        # 1. Payload Validation: Handle empty buffers or non-textual data (images/files)
        if not content or not isinstance(content, str) or not content.strip():
            print("[*] I/O Status: Clipboard buffer is empty or contains non-textual data.")
            return False, "The system clipboard is currently empty or contains non-text data (e.g., an image or a file)."
            
        # 2. Memory/UI Protection: Truncate massive text walls securely
        clean_content: str = content.strip()
        if len(clean_content) > max_length:
            print(f"[*] I/O Status: Truncating payload (exceeded {max_length} chars).")
            clean_content = clean_content[:max_length] + f"\n\n... [SYSTEM NOTICE: Payload truncated. Exceeded {max_length} characters.]"
            
        report: str = f"Here is the current text payload on your clipboard:\n\n{clean_content}"
        print("[✓] I/O Controller: Clipboard payload retrieved successfully.")
        
        return True, report
        
    except pyperclip.PyperclipException as pe:
        # Specifically catches headless server or Linux environment issues
        print(f"[X] OS Permission Denied: Clipboard access failed. {str(pe)}")
        return False, "Clipboard access denied by the operating system. If running on Linux, ensure 'xclip' or 'xsel' is installed."
        
    except Exception as e:
        print(f"[X] I/O Controller Error: {str(e)}")
        return False, f"Critical failure accessing the system clipboard. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Copy some text to your clipboard, then run this file to test the module independently.
    success, msg = read_clipboard_data()
    print(msg)