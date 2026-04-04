import os
import time
import threading
import requests
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from core.voice_handler import speak

# Safely handle CORS for seamless React/Node integration
try:
    from flask_cors import CORS
    CORS_AVAILABLE: bool = True
except ImportError:
    CORS_AVAILABLE: bool = False

# --- ENGINE IMPORTS ---
from core.engine import parse_intent, execute_action

# --- SYSTEM CONFIGURATION ---
load_dotenv()

NODE_BACKEND_URL: str = os.getenv("NODE_BACKEND_URL", "http://localhost:6446")
AI_ENGINE_SECRET: str = os.getenv("AI_ENGINE_SECRET", "super_secret_nexus_key_2024")
FLASK_PORT: int = int(os.getenv("FLASK_PORT", 5000))
WEBHOOK_TIMEOUT: int = 15  # Maximum seconds to wait for Node.js acknowledgment

app = Flask(__name__)
if CORS_AVAILABLE:
    CORS(app)  # Enables local testing directly from a browser or React frontend

# --- ASYNCHRONOUS WORKER ---
def process_command_background(command_id: str, prompt: str) -> None:
    """
    Handles AI processing and hardware execution in an isolated daemon thread.
    Prevents the Flask API from blocking while executing heavy OS tasks.
    """
    start_time: float = time.time()
    print(f"\n[⚡] EXECUTION SEQUENCE START: Command {command_id}")
    print(f"[*] Raw Directive: '{prompt}'")
    
    try:
        # 1. Intelligence Routing
        intent: Dict[str, Any] = parse_intent(prompt)
        action: str = intent.get("action", "chat")
        target: Optional[str] = intent.get("target")
        ai_response: str = intent.get("response", "Processing complete.")
        
        print(f"[*] Intent Parsed -> Action: '{action}' | Target: '{target}'")

        # 2. Hardware / OS Execution
        success, result_msg = execute_action(action, target)
            
       # 3. Dynamic Response Matrix
        if success and result_msg:
            ai_response = result_msg
            error_msg = None
        else:
            error_msg = result_msg if not success else None
            
        # --- THE VOICE UPGRADE ---
        # Speak the final response aloud before sending it to the UI
        speak(ai_response)
        # -------------------------
                
        # 4. Webhook Sync (Database Update)
        status = "completed" if success else "failed"
        
        payload: Dict[str, Any] = {
            "status": status,
            "aiResponse": ai_response,
            "actionTriggered": action,
            "targetPath": target,
            "errorMessage": error_msg
        }
        
        headers: Dict[str, str] = {"x-ai-api-key": AI_ENGINE_SECRET}
        webhook_url: str = f"{NODE_BACKEND_URL}/api/commands/{command_id}/status"
        
        print("[*] Synchronizing telemetry with central database...")
        response = requests.put(
            webhook_url, 
            json=payload, 
            headers=headers, 
            timeout=WEBHOOK_TIMEOUT
        )
        
        duration: float = round(time.time() - start_time, 2)
        
        if response.status_code == 200:
            print(f"[✓] Synchronization Complete. (Execution Time: {duration}s)")
        else:
            print(f"[!] Sync Warning: Node.js responded with HTTP {response.status_code}. Data: {response.text}")
            
    except requests.exceptions.RequestException as re:
        print(f"[X] Network Sync Failure: Could not reach Node backend. Error: {str(re)}")
    except Exception as e:
        print(f"[X] Critical Daemon Failure: {str(e)}")

# --- API ROUTES ---
@app.route('/execute', methods=['POST'])
def execute_command():
    """
    Primary ingestion endpoint. Validates security headers, spawns an execution thread, 
    and instantly returns a 202 Accepted status.
    """
    # 1. Strict Security Handshake
    incoming_key: Optional[str] = request.headers.get("x-ai-api-key")
    if incoming_key != AI_ENGINE_SECRET:
        print("[!] Security Alert: Unauthorized access attempt blocked.")
        return jsonify({"success": False, "message": "Unauthorized execution attempt"}), 403

    # 2. Payload Validation
    data: Optional[Dict[str, Any]] = request.json
    if not data:
        return jsonify({"success": False, "error": "Malformed or missing JSON payload"}), 400
        
    command_id: Optional[str] = data.get("commandId")
    prompt: Optional[str] = data.get("prompt")
    
    if not command_id or not prompt:
        return jsonify({"success": False, "error": "Payload missing required 'commandId' or 'prompt'"}), 400
        
    # 3. Asynchronous Thread Dispatch (Daemon=True prevents zombie processes)
    thread = threading.Thread(
        target=process_command_background, 
        args=(command_id, prompt),
        daemon=True 
    )
    thread.start()
    
    # 4. Immediate Acknowledgment
    return jsonify({
        "success": True, 
        "status": "processing", 
        "commandId": command_id,
        "message": "Execution sequence authorized and initiated."
    }), 202

@app.route('/health', methods=['GET'])
def health_check():
    """Diagnostic endpoint to verify engine uptime."""
    return jsonify({
        "status": "online", 
        "engine": "Nexus/VisOra Execution Daemon",
        "version": "2.0-PRO"
    }), 200

if __name__ == '__main__':
    print("\n" + "="*55)
    print(" 🚀 EXECUTION DAEMON ONLINE")
    print(f" 📍 Routing via: http://localhost:{FLASK_PORT}")
    print(f" 🔗 Synchronizing with: {NODE_BACKEND_URL}")
    print(f" 🛡️ Security: Enforced | CORS: {'Active' if CORS_AVAILABLE else 'Inactive'}")
    print("="*55 + "\n")
    
    # use_reloader=False prevents Flask from booting the AI models twice into memory
    app.run(port=FLASK_PORT, debug=True, use_reloader=False)