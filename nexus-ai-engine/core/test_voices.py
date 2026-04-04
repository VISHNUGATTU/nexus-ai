import pyttsx3

engine = pyttsx3.init()
voices = engine.getProperty('voices')

print("=== AVAILABLE NEXUS VOICES ===")
for index, voice in enumerate(voices):
    print(f"[{index}] Name: {voice.name}")
    print(f"    ID: {voice.id}\n")

# Let's test the first two just so you can hear the difference
if len(voices) > 0:
    engine.setProperty('voice', voices[0].id)
    engine.say("This is voice zero.")
    
if len(voices) > 1:
    engine.setProperty('voice', voices[1].id)
    engine.say("This is voice one.")

engine.runAndWait()