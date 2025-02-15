import hashlib
from fuzzywuzzy import fuzz

with open("commonpasswords.txt") as file:
    common_passwords = {line.strip() for line in file}

hashed_common_passwords = {hashlib.sha256(password.encode()).hexdigest() for password in common_passwords}

def fuzzy_check(user_password, common_passwords, threshold=80):
    for password in common_passwords:
        if fuzz.ratio(user_password, password) > threshold:
            return True
    return False

def check_common_passwords(password):
    hased_user_password = hashlib.sha256(password.encode()).hexdigest()

    if hased_user_password in hashed_common_passwords:
        return "Your password is too common. Please change it!"
    if fuzzy_check(password, common_passwords):
        return "Your password is very similar to common passwords. Please consider changing it"
    
    return "Good to go!"


user_password = input("Enter password: ")
print(check_common_passwords(user_password))