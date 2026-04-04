from datetime import datetime
from pathlib import Path
from typing import Tuple

# --- SYSTEM CONFIGURATION ---
# Centralized naming for the personal knowledge base
NOTES_DIRECTORY_NAME: str = "NexusNotes"
NOTES_FILENAME: str = "brain.md"

def _resolve_documents_path() -> Path:
    """
    Intelligently locates the primary Documents directory, 
    accounting for OS-specific cloud-syncing (OneDrive) relocations.
    """
    home: Path = Path.home()
    
    # Priority 1: Check for OneDrive-synced Documents (Standard on modern Windows)
    onedrive_docs: Path = home / "OneDrive" / "Documents"
    if onedrive_docs.exists():
        return onedrive_docs
        
    # Priority 2: Fallback to local system Documents
    return home / "Documents"

def append_to_notes(note_content: str) -> Tuple[bool, str]:
    """
    Silently commits a note or reminder to a central markdown-based knowledge repository.
    Features robust path resolution and atomic directory management.
    
    Args:
        note_content (str): The text payload to record.
        
    Returns:
        Tuple[bool, str]: Success status and the I/O report.
    """
    # 1. Payload Validation
    if not note_content or not str(note_content).strip():
        print("[X] Note Taker Error: Empty payload received.")
        return False, "The note content is empty and cannot be saved."

    clean_note: str = str(note_content).strip()
    print(f"[*] I/O Controller: Committing note to Second Brain...")
    
    try:
        # 2. Secure Directory & File Resolution
        docs_path: Path = _resolve_documents_path()
        notes_dir: Path = docs_path / NOTES_DIRECTORY_NAME
        
        # Atomically create directory structure if absent
        notes_dir.mkdir(parents=True, exist_ok=True)
        
        file_path: Path = notes_dir / NOTES_FILENAME
        is_new_file: bool = not file_path.exists()
        
        # 3. Temporal Metadata Generation
        now: datetime = datetime.now()
        # Precise timestamp format: 2024-05-20 | 02:45 PM
        timestamp: str = now.strftime("%Y-%m-%d | %I:%M %p")
        
        # 4. Synchronous Write Operation
        # Using 'utf-8' explicitly to prevent encoding issues across different OS locales
        with open(file_path, "a", encoding="utf-8") as file:
            # Inject a master header for fresh knowledge bases
            if is_new_file:
                file.write("# Nexus AI: Second Brain\n")
                file.write("Centralized repository for automated notes and reminders.\n\n")
                file.write("---\n\n")

            # Format the entry with professional Markdown schema
            file.write(f"### {timestamp}\n")
            file.write(f"- {clean_note}\n\n")
            file.write(f"---\n\n") 
            
        print(f"[✓] I/O Controller: Note successfully committed to {file_path}")
        return True, "Note securely saved to your Second Brain."
        
    except PermissionError:
        print(f"[X] I/O Access Denied: {NOTES_FILENAME} is currently locked by another process.")
        return False, f"Failed to save note. Please ensure '{NOTES_FILENAME}' is not open in another application."
        
    except OSError as oe:
        print(f"[X] OS System Error during I/O: {str(oe)}")
        return False, f"System-level error occurred while accessing the filesystem: {str(oe)}"
        
    except Exception as e:
        print(f"[X] Critical Note Taker Failure: {str(e)}")
        return False, f"An unexpected error occurred while writing to notes. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the module independently to verify directory creation and file appending
    success, msg = append_to_notes("Diagnostic: The internal knowledge relay is functioning correctly.")
    print(msg)