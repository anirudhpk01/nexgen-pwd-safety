from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("DrishtiSharma/codebert-base-password-strength-classifier-normal-weight-balancing")
model = AutoModelForSequenceClassification.from_pretrained("DrishtiSharma/codebert-base-password-strength-classifier-normal-weight-balancing")

def preprocess_password(password):
    # Tokenize the password
    inputs = tokenizer(password, return_tensors="pt", padding=True, truncation=True, max_length=512)
    return inputs

import torch

def predict_password_strength(password):
    # Preprocess the password
    inputs = preprocess_password(password)
    
    # Get model predictions
    with torch.no_grad():
        logits = model(**inputs).logits
    
    # Convert logits to probabilities
    probabilities = torch.softmax(logits, dim=1)
    
    # Get the predicted class (0: weak, 1: medium, 2: strong)
    predicted_class = torch.argmax(probabilities, dim=1).item()
    
    # Map class to label
    strength_map = {0: "Weak", 1: "Medium", 2: "Strong"}
    return strength_map[predicted_class]

# Test passwords
passwords = ["password", "P@ssw0rd123", "Secure123!", "123456", "qwerty"]

# Predict strength for each password
for pwd in passwords:
    strength = predict_password_strength(pwd)
    print(f"Password: {pwd}, Strength: {strength}")

# Save the model and tokenizer
model.save_pretrained("password_strength_model")
tokenizer.save_pretrained("password_strength_model")

strength = predict_password_strength("HFjfh34$3J4H%56")
print(f"Password: {pwd}, Strength: {strength}")
# Load the model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained("password_strength_model")
tokenizer = AutoTokenizer.from_pretrained("password_strength_model")
