import os
import re
import smtplib
import socket
from typing import Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Boot-level operations: Load environment variables once into memory
load_dotenv()

# --- SYSTEM CONFIGURATION ---
SMTP_SERVER: str = "smtp.gmail.com"
SMTP_PORT: int = 587
TIMEOUT_SECONDS: int = 15  # Prevents thread-hanging on network drop or firewall block

# Pre-compile the regex pattern for maximum validation speed
EMAIL_REGEX_PATTERN: re.Pattern = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def _is_valid_email(email_address: str) -> bool:
    """
    Validates email format using regex to prevent unnecessary network payload drops.
    """
    return bool(EMAIL_REGEX_PATTERN.match(email_address))

def send_email_background(target_email: str, subject: str, message_body: str) -> Tuple[bool, str]:
    """
    Silently authenticates with the SMTP server and transmits an email payload.
    Utilizes secure context managers and robust network exception handling.
    
    Args:
        target_email (str): The recipient's email address.
        subject (str): The subject line of the email.
        message_body (str): The plain-text payload of the email.
        
    Returns:
        Tuple[bool, str]: Success status and transmission report.
    """
    if not target_email:
        return False, "Target email address cannot be empty."
        
    clean_target: str = target_email.strip()
    print(f"[*] Comms Controller: Initiating secure transmission protocol to '{clean_target}'...")

    # 1. Payload & Input Validation
    if not _is_valid_email(clean_target):
        print(f"[X] Comms Error: Invalid target email format -> '{clean_target}'")
        return False, f"The address '{clean_target}' does not match standard email formatting."
        
    if not message_body or not str(message_body).strip():
        return False, "Cannot transmit an empty email body payload."

    sender_email: str | None = os.getenv("GMAIL_USER")
    app_password: str | None = os.getenv("GMAIL_APP_PASSWORD")

    if not sender_email or not app_password:
        print("[X] Comms Error: Missing SMTP credentials in environment variables.")
        return False, "Missing 'GMAIL_USER' or 'GMAIL_APP_PASSWORD' in your .env file."

    try:
        # 2. Construct the MIME Multipart Object
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = clean_target
        msg['Subject'] = str(subject).strip()
        msg.attach(MIMEText(str(message_body).strip(), 'plain'))

        print(f"[*] Establishing secure TLS handshake with {SMTP_SERVER}:{SMTP_PORT}...")

        # 3. Secure Context Manager for Network I/O
        # The 'with' block ensures the TCP socket is forcefully closed even if an exception is raised
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=TIMEOUT_SECONDS) as server:
            server.starttls()  # Upgrade connection to secure TLS encryption
            server.login(sender_email, app_password)
            server.send_message(msg)

        print("[✓] Comms Controller: Payload transmitted successfully.")
        return True, f"Successfully transmitted encrypted email to {clean_target}."

    except smtplib.SMTPAuthenticationError:
        print("[X] Network Auth Error: Invalid SMTP credentials.")
        return False, "Authentication failed. Please verify your 16-character Gmail App Password."
    except smtplib.SMTPConnectError:
        print("[X] Network Connect Error: Unable to reach SMTP server.")
        return False, "Failed to connect to the email server. Please check your internet connection or firewall."
    except smtplib.SMTPRecipientsRefused:
        print(f"[X] Network Delivery Error: Recipient '{clean_target}' refused.")
        return False, f"The email server refused delivery to '{clean_target}'. The address may not exist or is blocking incoming mail."
    except socket.timeout:
        print("[X] Network Timeout: Connection to SMTP server timed out.")
        return False, "The connection to the email server timed out. Please try again later."
    except smtplib.SMTPException as se:
        print(f"[X] Protocol Error: {str(se)}")
        return False, f"An underlying SMTP protocol error occurred: {str(se)}"
    except Exception as e:
        print(f"[X] Critical Comms Failure: {str(e)}")
        return False, f"An unexpected system error occurred during transmission. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    test_target = os.getenv("GMAIL_USER")
    if test_target:
        success, msg = send_email_background(
            target_email=test_target,
            subject="Nexus System Diagnostic",
            message_body="System diagnostic: The communications relay is operating at peak efficiency."
        )
        print(msg)
    else:
        print("[!] Please set GMAIL_USER in your .env to run the local integrity test.")