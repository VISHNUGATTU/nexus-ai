import os
import platform
from typing import Tuple

# Safely handle the hardware telemetry dependency
try:
    import psutil
    PSUTIL_AVAILABLE: bool = True
except ImportError:
    PSUTIL_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
BYTES_IN_GB: int = 1024 ** 3

def _bytes_to_gb(bytes_value: int) -> float:
    """Helper utility to convert raw bytes to rounded Gigabytes."""
    return round(bytes_value / BYTES_IN_GB, 2)

def _get_primary_mount_point() -> str:
    """OS-agnostic resolution of the primary storage drive."""
    return 'C:\\' if platform.system() == "Windows" else '/'

def get_system_vitals() -> Tuple[bool, str]:
    """
    Rapidly scans hardware metrics including CPU, RAM, Disk, Battery, and Thermals.
    Optimized for non-blocking execution in asynchronous/API environments.
    
    Returns:
        Tuple[bool, str]: Success status and the formatted hardware telemetry report.
    """
    print("[*] Vitals Controller: Initializing hardware telemetry scan...")
    
    if not PSUTIL_AVAILABLE:
        print("[!] Dependency Error: 'psutil' not installed.")
        return False, "Missing required hardware dependency: 'psutil'. Run 'pip install psutil'."

    try:
        # 1. CPU Telemetry (Non-blocking)
        # interval=None returns the usage since the last call instantly
        cpu_usage: float = psutil.cpu_percent(interval=None)
        if cpu_usage == 0.0:
            # Failsafe: If the buffer was completely empty, take a micro-sample (100ms)
            cpu_usage = psutil.cpu_percent(interval=0.1)

        # 2. Memory Telemetry
        ram = psutil.virtual_memory()
        ram_total: float = _bytes_to_gb(ram.total)
        ram_used: float = _bytes_to_gb(ram.used)
        ram_percent: float = ram.percent

        # 3. Storage Telemetry (Primary Drive)
        mount_point: str = _get_primary_mount_point()
        disk_info: str = ""
        try:
            disk = psutil.disk_usage(mount_point)
            disk_free: float = _bytes_to_gb(disk.free)
            disk_percent: float = disk.percent
            disk_info = f" | Disk @ {disk_percent}% ({disk_free}GB Free)"
        except PermissionError:
            pass # Silently skip if OS denies access to the root volume

        # 4. Power Telemetry (Graceful handling for Desktops)
        battery_info: str = ""
        battery = psutil.sensors_battery()
        if battery:
            power_status: str = "🔌 Plugged In" if battery.power_plugged else "🔋 On Battery"
            battery_info = f" | Power: {battery.percent}% ({power_status})"

        # 5. Thermal Telemetry (Best effort - hardware/OS dependent)
        temp_info: str = ""
        try:
            temps = psutil.sensors_temperatures()
            if temps and 'coretemp' in temps:
                current_temp: float = temps['coretemp'][0].current
                temp_info = f" | Temp: {current_temp}°C"
        except (AttributeError, PermissionError):
            pass # Silently skip if sensors are unavailable or restricted

        # 6. Payload Synthesis
        report: str = (
            f"Hardware Diagnostics: "
            f"CPU @ {cpu_usage}% | "
            f"RAM @ {ram_percent}% ({ram_used}GB/{ram_total}GB)"
            f"{disk_info}{battery_info}{temp_info}"
        )
        
        print(f"[✓] Vitals Controller: Telemetry acquired -> {report}")
        return True, report
        
    except Exception as e:
        print(f"[X] Critical Hardware Failure: {str(e)}")
        return False, f"An unexpected system error occurred while scanning hardware. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test the telemetry module independently
    success, msg = get_system_vitals()
    print(msg)