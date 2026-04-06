import os
import time
import threading
import requests
from typing import Dict, Any, Optional
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from core.voice_handler import speak
from flask_cors import CORS  # <--- Add this import
from faster_whisper import WhisperModel
# --- SILENCE WARNINGS ---
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
print("[*] Loading Nexus Voice Core (Whisper Large-v3-Turbo)...")
# 'large-v3-turbo' is the absolute bleeding edge for local, highly accurate transcription.
# We use int8 compression so it doesn't melt your CPU while maintaining elite accuracy.
whisper_model = WhisperModel("large-v3-turbo", device="cpu", compute_type="float32")

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
# --- ENGINE IMPORTS ---
from core.engine import parse_intent, execute_action

# --- SYSTEM CONFIGURATION ---
load_dotenv()

NODE_BACKEND_URL: str = os.getenv("NODE_BACKEND_URL", "http://localhost:6446")
AI_ENGINE_SECRET: str = os.getenv("AI_ENGINE_SECRET", "super_secret_nexus_key_2024")
FLASK_PORT: int = int(os.getenv("FLASK_PORT", 5000))
WEBHOOK_TIMEOUT: int = 15  # Maximum seconds to wait for Node.js acknowledgment

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

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({'success': False, 'message': 'No audio file provided'}), 400
        
    audio_file = request.files['audio']
    temp_path = "temp_voice_command.webm"
    
    try:
        # Save the raw audio from the browser
        audio_file.save(temp_path)
        
        # --- MILITARY-GRADE LOCAL TRANSCRIPTION ---
        segments, info = whisper_model.transcribe(
            temp_path, 
            beam_size=5,
            language="en",
            vad_filter=True, 
            # threshold=0.6 forces the engine to ignore static and breathing. 
            # It will ONLY transcribe if it is highly confident it hears a human voice.
            vad_parameters=dict(min_silence_duration_ms=500, threshold=0.6),
            condition_on_previous_text=False,
            # Whisper hates colons and labels. A natural, comma-separated string works flawlessly.
            initial_prompt="BhanuPrakash, Vishnu, YGK, Nexus, WhatsApp, GammaAI, VisOra."
        )
        
        # Stitch the transcribed segments together
        transcription = " ".join([segment.text for segment in segments]).strip()
        
        # Clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        print(f"[🎙️] Nexus Transcribed: {transcription}")
        return jsonify({'success': True, 'text': transcription})
        
    except Exception as e:
        print(f"[X] Whisper Error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

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
    print("="*55 + "\n")
    
    # use_reloader=False prevents Flask from booting the AI models twice into memory
    app.run(port=FLASK_PORT, debug=True, use_reloader=False)