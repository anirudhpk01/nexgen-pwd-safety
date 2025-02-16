import axios from "axios"
import { sha1 } from 'crypto-hash';
import { useState } from "react"

export default function AddPassword() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [result, setResult] = useState("")

	const checkPassword = async () => {
		setResult('');

		try {
			// Step 1: Check HIBP API
			const hashedPassword = (await sha1(newPassword)).toUpperCase();
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
				return;
			}

			// Step 2: Check common passwords
			const commonResponse = await axios.get(
				`http://localhost:7050/checkcommon?password=${newPassword}`
			);

			console.log(commonResponse)
			if (commonResponse.data.message !== 'Good to go!') {
				setResult(commonResponse.data.message);
				return
			}

			const validateResponse = await axios.get(
				`http://localhost:7050/validatetext?company_name=infosys&plaintext=${newPassword}`
			);

			// Handle validation response
			if (validateResponse.data.result === 'Plaintext validation passed') {
				if (newPassword !== confirmPassword) {
					setResult("New passwords don't match")
					return
				}

				const payload = {
					username: username,
					password: password,
					newpass: newPassword
				}

				try{
					const res = await axios.post("http://127.0.0.1:7050/updatepass", payload)
					setResult("")
				} catch (err) {
					setResult(err.response.data)
				}
			} else {
				// Handle both error formats from backend
				const errorResult = validateResponse.data.error || 
					validateResponse.data.result || 
					'Unknown validation error';
				setResult(errorResult);
			}
		} catch (error) {
			console.log(error)
			// Handle network errors and API responses
			if (error.response) {
				// The request was made and server responded with status code
				const backendError = error.response.data.error || 
					error.response.data.result || 
					'Request failed';
				setResult(backendError);
			} else {
				console.log(error)
				setResult('Failed to process request. Please try again.');
			}
		}
	};

	const handleSubmit = async () => {
		if (newPassword !== confirmPassword) {
			setResult("New passwords don't match")
			return
		}

		const payload = {
			username: username,
			password: password,
			newpass: newPassword
		}

		try{
			const res = await axios.post("http://127.0.0.1:7050/updatepass", payload)
			setResult("")
		} catch (err) {
			setResult(err.response.data)
		}

	}

	return (
		<div className="h-svh w-full flex flex-col items-center justify-center gap-4">
			<input className="input input-bordered" placeholder="Username" autoFocus onChange={(e) => {setUsername(e.target.value)}}/>
			<input className="input input-bordered" placeholder="Current Password" type="password" onChange={(e) => {setPassword(e.target.value)}}/>
			<input className="input input-bordered" placeholder="New Password" type="password" onChange={(e) => {setNewPassword(e.target.value)}}/>
			<input className="input input-bordered" placeholder="Re-Enter New Password" type="password" onChange={(e) => {setConfirmPassword(e.target.value)}}/>
			{result && <div className="text-red-500">{result}</div>}
			<button className="btn btn-primary" onClick={checkPassword}>Confirm</button>
		</div>
	)
}
