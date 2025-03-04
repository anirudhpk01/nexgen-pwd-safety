# AI-Powered Password Security System

### Enforcing Custom Company Password Policies using RAG Pipelines

## Overview
Our project aims to quantify the strength and security of a company’s password ecosystem. With the rise of password attacks and breaches, organizations require a robust, AI-powered password security system that enforces custom company password policies dynamically.

## Key Features
- **Custom Password Policy Enforcement**: Companies provide a policy document (PDF/TXT), which is ingested via an RAG pipeline to generate a dynamic Super-Regex system.
- **AI-Powered Password Strength Analysis**: Real-time breach checks via HaveIBeenPwned API and ML-based password strength assessment.
- **Secure Hash Storage**: No plaintext passwords are stored; SHA-1 hashes are used with an option for encryption.
- **Security Admin Dashboard**: Provides password strength insights and real-time breach monitoring.
- **Scalability**: Lightweight frontend for password checks, enterprise-wide scaling with Kafka/MQTT.

## Tech Stack
- **AI & Security**: LangChain, ChromaDB, Google Gemini API
- **Databases**: PostgreSQL, SQLite
- **Backend**: Node.js, Flask
- **Frontend**: Vite, React

## Running the Project

### 1. Accessing the Lightweight Frontend
```sh
cd test-frontend
npm run dev
```

### 2. Running the Backend Services
```sh
cd test-backend
node index.js
```

### 3. Running the Company Policy Ingestion Pipeline
```sh
cd rag-backend
python main.py
```

### 4. Running the Password Security Features
#### Common Password Filtering
```sh
cd pwd-security
python run_common_passwords.py
```

#### Compromised Password Check
```sh
cd pwd-security
python run_compromised_pwd_check.py
```

#### Password Strength Check
```sh
cd pwd_strength_check
python predict.py
```

### 5. Running the Security Admin Dashboard & Update Password Policy
```sh
cd frontend
npm run dev
```
```sh
cd node-backend
npm start
```
```sh
pocketbase serve
```

## Major Takeaways for Companies
- Define and enforce specific password policies dynamically.
- Ensure real-time password breach checks.
- Get a detailed security dashboard for monitoring password strength.
- Avoid common passwords and prevent password reuse.
- Zero plaintext password storage for maximum security.
- Scalable and easy-to-integrate solution with hassle-free UI.

## Originality
- AI converts company-specific policy documents into a Super-Regex dynamically.
- Detects common password patterns and password reuse.
- Flags compromised passwords and evaluates password strength using AI.

## Scalability
- Lightweight frontend ensures smooth user experience.
- Enterprise-wide scalability achieved via Kafka/MQTT.

---
🔒 **Enhancing Password Security with AI – One Company at a Time!** 🔒
