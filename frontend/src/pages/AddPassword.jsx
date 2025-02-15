import axios from "axios"
import { useState } from "react"

export default function AddPassword() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [message, setMessage] = useState("")

	const handleSubmit = async () => {
		if (newPassword !== confirmPassword) {
			setMessage("New passwords don't match")
			return
		}

		const payload = {
			username: username,
			password: password,
			newpass: newPassword
		}

		try{
			const res = await axios.post("http://127.0.0.1:7050/updatepass", payload)
		} catch (err) {
			setMessage(err.response.data)
		}

	}

	return (
		<div className="h-svh w-full flex flex-col items-center justify-center gap-4">
			<input className="input input-bordered" placeholder="Username" autoFocus onChange={(e) => {setUsername(e.target.value)}}/>
			<input className="input input-bordered" placeholder="Current Password" type="password" onChange={(e) => {setPassword(e.target.value)}}/>
			<input className="input input-bordered" placeholder="New Password" type="password" onChange={(e) => {setNewPassword(e.target.value)}}/>
			<input className="input input-bordered" placeholder="Re-Enter New Password" type="password" onChange={(e) => {setConfirmPassword(e.target.value)}}/>
			{message && <div className="text-red-500">{message}</div>}
			<button className="btn btn-primary" onClick={handleSubmit}>Confirm</button>
		</div>
	)
}
