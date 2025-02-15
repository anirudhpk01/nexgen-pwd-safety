import requests
from hashlib import sha1

# Step 1: Function to check if a password is compromised
def is_password_compromised(password):
    # Hash the password using SHA-1
    password_hash = sha1(password.encode()).hexdigest().upper()
    prefix, suffix = password_hash[:5], password_hash[5:]

    # Query the HIBP API
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception("Failed to query HIBP API")

    # Check if the suffix exists in the response
    for line in response.text.splitlines():
        if line.startswith(suffix):
            return True, f"Password compromised. Found in {line.split(':')[1]} breaches."

    return False, "Password is safe."

# Step 2: Test the function
password = "akshay2003"
is_compromised, message = is_password_compromised(password)
print(message)
