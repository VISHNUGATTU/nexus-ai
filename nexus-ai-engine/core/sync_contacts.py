import json
import re
import os

def build_nexus_phonebook(vcf_path="contacts.vcf", output_path="contacts.json"):
    """
    Parses a raw vCard file from iOS/Android and compiles a clean, 
    Fuzzy-Logic ready JSON dictionary for the Nexus execution engine.
    """
    print("\n[*] Initializing Contact Synchronization Protocol...")
    
    if not os.path.exists(vcf_path):
        print(f"[X] FATAL: '{vcf_path}' not found.")
        print("    Please export your contacts from your phone as a .vcf file,")
        print("    place it in this folder, and name it 'contacts.vcf'.\n")
        return

    contacts = set()  # Using a set to automatically drop duplicate entries
    
    try:
        # utf-8 with 'ignore' ensures weird emojis don't crash the parser
        with open(vcf_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                # 'FN:' is the universal vCard tag for "Formatted Name"
                if line.startswith("FN:"):
                    # Strip the tag and clean up whitespace
                    raw_name = line.replace("FN:", "").strip()
                    
                    # Optional: Filter out pure numbers or empty names
                    if raw_name and not raw_name.replace(" ", "").replace("+", "").isdigit():
                        contacts.add(raw_name)

        # Convert back to a sorted list for the JSON file
        clean_contact_list = sorted(list(contacts))
        
        # Dump to the JSON file that our engine uses
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(clean_contact_list, f, indent=4, ensure_ascii=False)
            
        print(f"[✓] Synchronization Complete!")
        print(f"[*] Successfully extracted and compiled {len(clean_contact_list)} contacts into {output_path}.")
        print("[*] Nexus Fuzzy Logic engine is now fully armed.\n")

    except Exception as e:
        print(f"[X] An error occurred during synchronization: {e}")

if __name__ == "__main__":
    build_nexus_phonebook()