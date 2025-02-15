import hashlib
import hmac
from pybloom_live import BloomFilter
from Levenshtein import distance
import os

# Secret key for HMAC
SECRET_KEY = b'enterprise_secret_key'

# Initialize Bloom filter
bloom = BloomFilter(capacity=100000000, error_rate=0.001)

def hash_password(password):
    """Hashes password using HMAC-SHA256 for secure storage."""
    return hmac.new(SECRET_KEY, password.encode(), hashlib.sha256).hexdigest()

def generate_variants(password):
    """Generates common variants of a password."""
    # variants = {password.lower(), password.upper(), password.capitalize()}
    # leet_map = {'a': '@', 'o': '0', 'e': '3', 's': '$', 'i': '1'}
    
    # for key, value in leet_map.items():
    #     if key in password:
    #         variants.add(password.replace(key, value))
    
    # return variants

    os.system(f"python pseudohash.py -w {password} -cpa -cpb -an 5")
    with open("output.txt") as file:
        return list(map(lambda x: x.strip(), file.readlines()))

def add_password_to_bloom(password):
    """Stores hashed password variations in Bloom filter."""
    variants = generate_variants(password)
    for variant in variants:
        hashed_variant = hash_password(variant)
        bloom.add(hashed_variant)

def check_password_similarity(new_password):
    """Checks if the new password (or similar variants) exists in Bloom filter."""
    variants = generate_variants(new_password)
    hashed_new_password = hash_password(new_password)

    similar_passwords = []
    for variant in variants:
        hashed_variant = hash_password(variant)
        if hashed_variant in bloom:
            score = 1 - (distance(new_password, variant) / max(len(new_password), len(variant)))
            similar_passwords.append((variant, score))

    similar_passwords.sort(key=lambda x: x[1], reverse=True)
    return similar_passwords

# Example: Adding known weak passwords
weak_passwords = ["qwerty"]
for password in weak_passwords:
    add_password_to_bloom(password)

# Example: Checking new password
new_password = input("Enter new password: ")
similar_passwords = check_password_similarity(new_password)

if similar_passwords:
    print("❌ Password too similar to known weak passwords:")
    for pw, score in similar_passwords:
        print(f"  - {pw} (Similarity Score: {score:.2f})")
else:
    print("✅ Password is strong and accepted.")
