const {createHash} = require("crypto")
const express = require("express")
const PocketBase = require('pocketbase/cjs')

const pb = new PocketBase("http://localhost:8090")

const PORT = 7000

const app = express()

app.use(express.json())

app.get("/", (req, res) => {
	res.send("<h1>Server running</h1>")
})

app.post("/newpass", async (req, res) => {
	const username = req.body.username
	const password = req.body.password

	const sha256 = createHash("sha256").update(password).digest("hex")

	const payload = {
		username: username,
		password: password,
		sha256: sha256,
	}

	const record = await pb.collection('Nexgen').create(payload)

	res.send("Done")
})

const checkReuse = async (password) => {
	const sha256 = createHash("sha256").update(password).digest("hex")
	const passwords = await pb.collection("Nexgen").getFullList({
		filter: `sha256 = "${sha256}"`
	})

	return passwords.length
}

app.post("/updatepass", async (req, res) => {
	const username = req.body.username
	const password = req.body.password
	const newpass = req.body.newpass

	const sha256 = createHash("sha256").update(password).digest("hex")
	const response = await pb.collection("Nexgen").getFirstListItem(`username="${username}"`)
	if (sha256 != response.sha256){
		res.status(401).send("Wrong Password")
		return
	}

	console.log(await checkReuse(newpass))

	const id = response.id

	response.sha256 = createHash("sha256").update(newpass).digest("hex")

	await pb.collection("Nexgen").update(id, response)

	res.send("Done")
})

app.listen(PORT, () => {
	console.log(`Serving on http://localhost:${PORT}`)
})
