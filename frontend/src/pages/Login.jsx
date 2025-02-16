import {useState} from "react"
import { useNavigate } from "react-router"

function Login() {
	const [password, setPassword] = useState("")
	const [message, setMessage] = useState("")

	const navigate = useNavigate()

	const handleSubmit = () => {
		const pass = "123"
		if (password === pass) {
			navigate("/app")
		} else {
			setMessage("Wrong Password")
		}
	}

	return (
		<div className="h-svh w-full flex flex-col items-center justify-center gap-4">
			<input className="input input-bordered" placeholder="Password" type="password" onChange={(e) => {setPassword(e.target.value)}}/>
			{message && <div className="text-red-500">{message}</div>}
			<button className="btn btn-primary" onClick={handleSubmit}>Login</button>
		</div>
	)
}

export default Login
