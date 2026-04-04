from typing import Tuple, Dict

# Safely handle the heavy financial dependency
try:
    import yfinance as yf
    YFINANCE_AVAILABLE: bool = True
except ImportError:
    YFINANCE_AVAILABLE: bool = False

# --- SYSTEM CONFIGURATION ---
# Extracted mapping to handle international market tickers dynamically
CURRENCY_MAP: Dict[str, str] = {
    "USD": "$",
    "INR": "₹",
    "EUR": "€",
    "GBP": "£",
    "JPY": "¥",
    "CAD": "CA$",
    "AUD": "A$"
}

def fetch_stock_price(ticker_symbol: str) -> Tuple[bool, str]:
    """
    Silently connects to Yahoo Finance to fetch real-time market data.
    Utilizes multi-day history to prevent weekend/holiday crashes and dynamically formats currency.
    
    Args:
        ticker_symbol (str): The financial ticker to query (e.g., AAPL, TSLA, INFY.NS).
        
    Returns:
        Tuple[bool, str]: Success status and the formatted market report.
    """
    if not ticker_symbol or not ticker_symbol.strip():
        return False, "Ticker symbol cannot be empty."

    # Strip illegal characters and ensure uppercase for the API
    clean_ticker: str = ticker_symbol.upper().replace("$", "").strip()
    print(f"[*] Market Controller: Establishing secure link to market API for '{clean_ticker}'...")

    if not YFINANCE_AVAILABLE:
        print("[!] Dependency Error: 'yfinance' not installed.")
        return False, "Missing required system dependency: 'yfinance'. Run 'pip install yfinance'."

    try:
        stock = yf.Ticker(clean_ticker)
        
        # 1. Fetch robust history to bypass market closure days
        data = stock.history(period="5d")
        
        if data.empty:
            print(f"[X] Market Error: Invalid ticker or missing data for '{clean_ticker}'.")
            return False, f"Could not find valid market data for '{clean_ticker}'. Ensure it is a valid, active symbol."
            
        # 2. Extract precise financial metrics (Explicitly cast to float to strip NumPy types)
        current_price: float = float(data['Close'].iloc[-1])
        
        # True daily trend compares Current Price to the Previous Close
        if len(data) >= 2:
            prev_close: float = float(data['Close'].iloc[-2])
            percent_change: float = ((current_price - prev_close) / prev_close) * 100.0
        else:
            # Failsafe for a brand new IPO with only a single day of market history
            open_price: float = float(data['Open'].iloc[-1])
            percent_change: float = ((current_price - open_price) / open_price) * 100.0
            
        # 3. Dynamic Currency Detection via fast_info (Zero-lag network request)
        currency_code: str = "USD"
        try:
            currency_code = str(stock.fast_info.get('currency', 'USD')).upper()
        except Exception:
            pass  # Failsafe: Silently default to USD if the fast_info property is missing
            
        currency_symbol: str = CURRENCY_MAP.get(currency_code, f"{currency_code} ")
            
        # 4. Payload Formatting
        trend_icon: str = "up 📈" if percent_change >= 0 else "down 📉"
        report: str = f"{clean_ticker} is currently trading at {currency_symbol}{current_price:.2f}. It is {trend_icon} {abs(percent_change):.2f}% from its previous close."
        
        print(f"[✓] Market Controller: Payload retrieved -> {report}")
        return True, report
        
    except Exception as e:
        print(f"[X] Critical Market Failure: {str(e)}")
        return False, f"An unexpected system error occurred while fetching market data. Error: {str(e)}"

# --- Module Integrity Test ---
if __name__ == "__main__":
    # Test a standard US stock
    success_us, msg_us = fetch_stock_price("AAPL")
    print(msg_us)
    
    # Test an international stock (Ensures dynamic currency switching to ₹ works)
    success_in, msg_in = fetch_stock_price("RELIANCE.NS")
    print(msg_in)