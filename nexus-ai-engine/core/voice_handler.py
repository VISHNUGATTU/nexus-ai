import pyttsx3
import speech_recognition as sr
import threading
from typing import Optional

# --- SYSTEM CONFIGURATION ---
# Initialize the offline Text-to-Speech engine
try:
    engine = pyttsx3.init()
    
    # Optional: Tweak the voice to sound more "AI" and less robotic
    voices = engine.getProperty('voices')
    # On Windows, voices[0] is usually male (David), voices[1] is usually female (Zira)
    if len(voices) > 1:
        engine.setProperty('voice', voices[1].id) 
        
    engine.setProperty('rate', 175)    # Speed of speech (words per minute)
    engine.setProperty('volume', 1.0)  # Volume (0.0 to 1.0)
except Exception as e:
    print(f"[!] Warning: TTS Engine failed to initialize. Error: {e}")

def speak(text: str) -> None:
    """
    Takes a string and speaks it aloud using the native OS voice.
    Runs on a daemon thread to prevent blocking the main execution loop.
    """
    if not text:
        return
        
    def _speak_task(speech_text: str):
        try:
            print(f"[🔊] Nexus: {speech_text}")
            engine.say(speech_text)
            engine.runAndWait()
        except Exception as e:
            print(f"[X] Voice Synthesis Error: {e}")

    # Fire and forget - prevents the Flask API from hanging while speaking
    threading.Thread(target=_speak_task, args=(text,), daemon=True).start()

def listen_for_command(timeout: int = 5, phrase_time_limit: int = 10) -> Optional[str]:
    """
    Activates the default system microphone and listens for a voice command.
    
    Args:
        timeout: Seconds to wait for someone to start speaking.
        phrase_time_limit: Maximum seconds the user can speak before it cuts off.
        
    Returns:
        str: The transcribed text, or None if it failed to understand.
    """
    recognizer = sr.Recognizer()
    
    with sr.Microphone() as source:
        print("\n[🎙️] Microphone HOT - Adjusting for ambient noise...")
        # Calibrate against background static for 1 second
        recognizer.adjust_for_ambient_noise(source, duration=1)
        
        speak("I am listening.")
        print("[🎙️] Listening...")
        
        try:
            # Capture the audio buffer
            audio_data = recognizer.listen(
                source, 
                timeout=timeout, 
                phrase_time_limit=phrase_time_limit
            )
            
            print("[🎙️] Processing audio stream...")
            # Send to Google's free Web Speech API for fast transcription
            # (You can upgrade this to offline Whisper AI later if needed)
            transcription = recognizer.recognize_google(audio_data)
            
            print(f"[✓] Transcribed: '{transcription}'")
            return transcription
            
        except sr.WaitTimeoutError:
            print("[!] Listening timed out. No speech detected.")
            return None
        except sr.UnknownValueError:
            print("[!] Acoustic error: Could not understand audio.")
            speak("I didn't quite catch that.")
            return None
        except sr.RequestError as e:
            print(f"[X] API Error: Could not request results; {e}")
            speak("My speech recognition service is currently offline.")
            return None