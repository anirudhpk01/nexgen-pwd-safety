import re
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from flask import Flask, request

app = Flask(__name__)

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
@app.route("/strength")
def predict_password_strength():
    password = request.args.get("password")
    features = [extract_features(password)]
    prediction = model.predict(features)[0]
    return label_encoder.inverse_transform([prediction])[0]

if __name__ == "__main__":
    app.run(debug=True)
