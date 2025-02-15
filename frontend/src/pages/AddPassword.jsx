import { useState } from "react"

export default function AddPassword() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")

    const handleScan = () => {
        if (!password || !confirmPassword) {
            setMessage("Please fill out both fields")
            return
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match")
            return
        }

        // simulate the password scan
        setMessage("Scan started!")
    }

    return (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">Add New Password</h3>
          <label className="block mb-2">Enter Password</label>
          <input 
            type="password" 
            className="input input-bordered w-full mb-4" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <label className="block mb-2">Re-enter Password</label>
          <input 
            type="password" 
            className="input input-bordered w-full mb-4" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          
          {message && <p className="text-red-500 mb-4">{message}</p>}
          
          <button className="btn btn-primary w-full" onClick={handleScan}>Scan</button>
        </div>
      )
}