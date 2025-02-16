import React, { useState } from 'react';
import axios from 'axios';
import { sha1 } from 'crypto-hash';
import { useNavigate } from 'react-router-dom';

function App({ company_name }) {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkPassword = async () => {
    if (!password) {
      setResult('Please enter a password.');
      return;
    }
    setLoading(true);
    setResult('');

    try {
      // Step 1: Check HIBP API
      const hashedPassword = (await sha1(password)).toUpperCase();
      const prefix = hashedPassword.slice(0, 5);
      const suffix = hashedPassword.slice(5);
      const hibpResponse = await axios.get(
        `https://api.pwnedpasswords.com/range/${prefix}`
      );

      const found = hibpResponse.data.split('\n').some((line) => 
        line.startsWith(suffix)
      );

      if (found) {
        const breachCount = hibpResponse.data
          .split('\n')
          .find((line) => line.startsWith(suffix))
          .split(':')[1];
        setResult(`Password compromised! Found in ${breachCount} breaches.`);
        setLoading(false);
        return;
      }

      // Step 2: Check common passwords
      const commonResponse = await axios.get(
        `http://localhost:3000/checkcommon?password=${encodeURIComponent(password)}`
      );
      
      if (commonResponse.data.message !== 'Good to go!') {
        setResult(commonResponse.data.message);
        setLoading(false);
        return;
      }

      // Step 3: Validate against company parameters
      const validateResponse = await axios.get(
        `http://localhost:3000/validate-text?company_name=${encodeURIComponent(company_name)}&plaintext=${encodeURIComponent(password)}`
      );

      // Handle validation response
      if (validateResponse.data.message === 'Plaintext validation passed') {
        navigate('/nextpage');
      } else {
        // Handle both error formats from backend
        const errorMessage = validateResponse.data.error || 
                           validateResponse.data.message || 
                           'Unknown validation error';
        setResult(errorMessage);
      }
    } catch (error) {
      // Handle network errors and API responses
      if (error.response) {
        // The request was made and server responded with status code
        const backendError = error.response.data.error || 
                           error.response.data.message || 
                           'Request failed';
        setResult(backendError);
      } else {
        setResult('Failed to process request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">TopSecret Password Client</h1>
        <h2 className="text-lg mb-4 text-center">For the company, {company_name}</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={checkPassword}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Submit Plaintext'}
        </button>
        {result && (
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
