import os
import platform
import subprocess
from pathlib import Path
from typing import Tuple, List, Set

# --- SYSTEM CONFIGURATION ---
# Filler words to strip from the query to isolate the true filename
IGNORE_WORDS: Set[str] = {"document", "file", "pdf", "txt", "my", "the", "open", "image", "picture", "photo", "pic", "img", "jpg", "png", "jpeg", "video", "movie", "mp4"}

# Heavy or restricted directories to completely bypass for microsecond execution speeds
IGNORE_DIRS: Set[str] = {"node_modules", ".git", ".venv", "venv", "env", "__pycache__", "AppData", "Library", "build", "dist", ".idea", ".vscode"}

def _get_target_extensions(query: str) -> Tuple[str, ...]:
    """Dynamically determines the expected file extension based on semantic keywords."""
    if any(word in query for word in ["image", "picture", "photo", "pic", "img"]):
        return ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg')
    elif any(word in query for word in ["video", "movie", "mp4"]):
        return ('.mp4', '.mkv', '.avi', '.mov', '.wmv')
    elif any(word in query for word in ["document", "pdf", "txt", "doc", "file"]):
        return ('.pdf', '.docx', '.txt', '.xlsx', '.csv', '.pptx')
    return ()

def _clean_search_query(query: str) -> str:
    """Strips filler words to extract the core filename request."""
    search_terms = [word for word in query.split() if word not in IGNORE_WORDS]
    return " ".join(search_terms)

def open_local_file(target_filename: str) -> Tuple[bool, str]:
    """
    Silently and rapidly scans standard user directories to find and launch a file.
    Utilizes aggressive directory pruning to bypass heavy developer environments.
    
    Args:
        target_filename (str): The natural language file request.
        
    Returns:
        Tuple[bool, str]: Success status and the execution report.
    """
    if not target_filename or not target_filename.strip():
        return False, "Target filename cannot be empty."

    print(f"[*] I/O Controller: Initiating rapid scan for '{target_filename}'...")
    target_lower: str = target_filename.lower().strip()
    
    # 1. Parameter Extraction
    extensions: Tuple[str, ...] = _get_target_extensions(target_lower)
    clean_name: str = _clean_search_query(target_lower)
    
    if not clean_name:
        return False, "Could not isolate a specific filename from the command."
        
    # 2. Dynamic Universal Directory Mapping
    home: Path = Path.home()
    search_dirs: List[Path] = [
        home / "Desktop", 
        home / "Documents", 
        home / "Downloads", 
        home / "Pictures", 
        home / "Videos"
    ]
    
    # Safely inject OneDrive paths if the local environment utilizes cloud syncing
    for od_name in ["OneDrive", "OneDrive - Personal"]:
        od_path = home / od_name
        if od_path.exists():
            search_dirs.extend([od_path / "Desktop", od_path / "Documents", od_path / "Pictures"])

    # 3. High-Performance File Traversal
    found_path: str | None = None
    
    for search_dir in search_dirs:
        if not search_dir.exists():
            continue
            
        try:
            for root, dirs, files in os.walk(str(search_dir)):
                # OPTIMIZATION: Prune hidden directories and heavy folders in-place.
                # This prevents traversing tens of thousands of developer dependency files.
                dirs[:] = [d for d in dirs if not d.startswith('.') and d not in IGNORE_DIRS]
                
                for file in files:
                    file_lower: str = file.lower()
                    
                    # Extension validation (Fastest filter first)
                    if extensions and not file_lower.endswith(extensions):
                        continue
                        
                    # Semantic validation
                    if all(term in file_lower for term in clean_name.split()):
                        found_path = os.path.join(root, file)
                        break 
                
                if found_path: break 
            if found_path: break 
            
        except PermissionError:
            # Silently skip directories locked by the OS
            continue

    # 4. Native OS Execution Handling
    if not found_path:
        print(f"[X] I/O Error: File '{clean_name}' not located.")
        return False, f"Could not locate any file matching '{clean_name}' in standard directories."
        
    print(f"[*] Match Confirmed: {found_path}")
    
    try:
        os_name: str = platform.system()
        if os_name == "Windows":
            os.startfile(found_path)  # Direct Windows shell execution
        elif os_name == "Darwin":
            subprocess.run(["open", found_path], check=True)
        elif os_name == "Linux":
            subprocess.run(["xdg-open", found_path], check=True)
        else:
            return False, f"Unsupported operating system for file execution: {os_name}"
            
        return True, f"Successfully executed {os.path.basename(found_path)}."
        
    except subprocess.CalledProcessError as cpe:
        print(f"[X] OS Execution Error: {str(cpe)}")
        return False, f"Found the file, but the OS failed to open it. Error: {str(cpe)}"
    except Exception as e:
        print(f"[X] Critical Execution Failure: {str(e)}")
        return False, f"Unexpected error while opening the file. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the module's search speed and execution logic independently
    success, msg = open_local_file("document resume")
    print(msg)