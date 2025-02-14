import json
import re
from typing import Dict, Any

# Step 1: Simulate RAG LLM Responses (Mocked for simplicity)
def extract_rules_from_policy():
    return {
        "min_length": 12,
        "max_length": 20,
        "prefix_in_text": "infosys",
        "suffix_in_text": "dinosaur",
        "patterns_in_text": ["hello", "world"]
    }

# Step 2: Save Extracted Rules to JSON
def save_rules_to_json(rules: Dict[str, Any], filename: str):
    with open(filename, 'w') as file:
        json.dump(rules, file, indent=4)

# Step 3: Password Validator Function
def validate_password(password: str, rules: Dict[str, Any]) -> bool:
    if len(password) < rules['min_length'] or len(password) > rules['max_length']:
        return False
    
    if 'prefix_in_text' in rules and not password.startswith(rules['prefix_in_text']):
        return False
    
    if 'suffix_in_text' in rules and not password.endswith(rules['suffix_in_text']):
        return False
    
    for pattern in rules.get('patterns_in_text', []):
        if pattern not in password:
            return False
    
    return True

# Example Usage
rules = extract_rules_from_policy()
save_rules_to_json(rules, 'password_rules.json')

# Validate a password
password = "infosys_2010192010hello00__world09dinosaur"
is_valid = validate_password(password, rules)
print("Password is valid:" if is_valid else "Password is invalid")
