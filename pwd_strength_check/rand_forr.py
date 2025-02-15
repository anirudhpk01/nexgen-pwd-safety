import pandas as pd

# Load the dataset
df = pd.read_csv("password_dataset1 (1).csv")

# Display the first few rows
print(df.head())

from sklearn.preprocessing import LabelEncoder

# Encode the target variable
label_encoder = LabelEncoder()
df['Strength'] = label_encoder.fit_transform(df['Strength'])

# Map the encoded labels back to their original values for reference
label_mapping = {i: label for i, label in enumerate(label_encoder.classes_)}
print("Label Mapping:", label_mapping)

import re

# Feature extraction
def extract_features(password):
    features = {
        'length': len(password),
        'num_uppercase': len(re.findall(r'[A-Z]', password)),
        'num_lowercase': len(re.findall(r'[a-z]', password)),
        'num_digits': len(re.findall(r'[0-9]', password)),
        'num_special': len(re.findall(r'[^A-Za-z0-9]', password))
    }
    return features

# Apply feature extraction to the dataset
df_features = df['Password'].apply(lambda x: pd.Series(extract_features(x)))

# Combine features with the target variable
df_processed = pd.concat([df_features, df['Strength']], axis=1)

# Display the processed dataset
print(df_processed.head())

# Check class distribution
class_distribution = df['Strength'].value_counts(normalize=True)
print("Class Distribution in Original Dataset:")
print(class_distribution)

from sklearn.model_selection import train_test_split

# Features (X) and target (y)
X = df_processed.drop('Strength', axis=1)
y = df_processed['Strength']

# Split the dataset with stratification
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Check class distribution in training and testing sets
print("Class Distribution in Training Set:")
print(y_train.value_counts(normalize=True))

print("Class Distribution in Testing Set:")
print(y_test.value_counts(normalize=True))

# Verify class distribution in training set
train_distribution = y_train.value_counts(normalize=True)
print("Training Set Class Distribution:")
print(train_distribution)

# Verify class distribution in testing set
test_distribution = y_test.value_counts(normalize=True)
print("Testing Set Class Distribution:")
print(test_distribution)

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# Initialize the model
model = RandomForestClassifier(random_state=42)

# Train the model
model.fit(X_train, y_train)

# Predict on the testing set
y_pred = model.predict(X_test)

# Classification report
print("Classification Report:")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# Confusion matrix
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

import joblib

# Save the model
joblib.dump(model, "password_strength_classifier.pkl")

# Save the label encoder (to decode predictions later)
joblib.dump(label_encoder, "label_encoder.pkl")

import re
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

# Define feature extraction function
def extract_features(password):
    return [
        len(password),
        len(re.findall(r'[A-Z]', password)),
        len(re.findall(r'[a-z]', password)),
        len(re.findall(r'[0-9]', password)),
        len(re.findall(r'[^A-Za-z0-9]', password))
    ]

# Load dataset for training if needed
df = pd.read_csv("password_dataset1.csv")
label_encoder = LabelEncoder()
df['Strength'] = label_encoder.fit_transform(df['Strength'])

X = df['Password'].apply(extract_features).tolist()
y = df['Strength']

# Train the model if not already saved
try:
    model = joblib.load("password_strength_model.pkl")
except FileNotFoundError:
    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    joblib.dump(model, "password_strength_model.pkl")

# Function to test password strength
def predict_password_strength(password):
    features = [extract_features(password)]
    prediction = model.predict(features)[0]
    return label_encoder.inverse_transform([prediction])[0]

# User input loop
def main():
    while True:
        password = input("Enter a password (or type 'exit' to quit): ")
        if password.lower() == 'exit':
            break
        strength = predict_password_strength(password)
        print(f"Password Strength: {strength}")

if __name__ == "__main__":
    main()
