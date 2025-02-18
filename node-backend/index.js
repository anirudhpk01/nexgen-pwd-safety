const axios = require("axios")
const cors = require("cors")
const {createHash} = require("crypto")
const express = require("express")
const fs = require("fs")
const Fuse = require('fuse.js');
const PocketBase = require('pocketbase/cjs')
const { Pool } = require('pg');
const math = require("mathjs")

const pb = new PocketBase("http://localhost:8090")

const PORT = 7050

PGHOST='ep-mute-boat-a53qmt0d-pooler.us-east-2.aws.neon.tech'
PGDATABASE='trial'
PGUSER='trial_owner'
PGPASSWORD='pfUPK60AktIV'

// PostgreSQL connection setup
const pool = new Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: 5432,
    ssl: {require: true}
});

const app = express()

app.use(express.json())
app.use(cors())

const commonPasswords = fs.readFileSync('commonpasswords.txt', 'utf-8')
  .split('\n')
  .map(password => password.trim())
  .filter(password => password);

const hashedCommonPasswords = new Set(
  commonPasswords.map(password => createHash('sha256').update(password).digest('hex'))
);

const fuse = new Fuse(commonPasswords, { threshold: 0.2 }); // 0.2 corresponds to about 80% similarity

app.get("/", (req, res) => {
	res.send("<h1>Server running</h1>")
})

app.post("/newpass", async (req, res) => {
	const username = req.body.username
	const password = req.body.password

	const sha256 = createHash("sha256").update(password).digest("hex")
	const sha1 = createHash("sha1").update(password).digest("hex")

	console.log(username)
	const payload = {
		username: username,
		sha256: sha256,
		sha1: sha1,
	}

	const record = await pb.collection('Nexgen').create(payload)
	const response = await axios.get(`http://localhost:5000/strength?password=${password}`)
	let score
	if(response.data === "Strong") {
		score = 10
	} else if (response.data === "Medium") {
		score = 7
	} else {
		score = 3
	}
	await pb.collection("strength").create({username: username, score: score})

	res.send("Done")
})

const checkReuse = async (password) => {
	const sha256 = createHash("sha256").update(password).digest("hex")
	const passwords = await pb.collection("Nexgen").getFullList({
		filter: `sha256 = "${sha256}"`
	})

	return passwords.length
}

const checkCompromised = async (sha1) => {
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    try {
        // Query the HIBP API
        const url = `https://api.pwnedpasswords.com/range/${prefix}`;
        const response = await axios.get(url);

        // Check if the suffix exists in the response
        const hashes = response.data.split('\n');
        for (const line of hashes) {
            if (line.startsWith(suffix)) {
                const count = line.split(':')[1].trim();
                return count
            }
        }

        return { isCompromised: false, message: "Password is safe." };
    } catch (error) {
        throw new Error(`Failed to query HIBP API: ${error.message}`);
    }
}

app.post("/updatepass", async (req, res) => {
	const username = req.body.username
	const password = req.body.password
	const newpass = req.body.newpass

	const sha256 = createHash("sha256").update(password).digest("hex")
	let response = await pb.collection("Nexgen").getFirstListItem(`username="${username}"`)
	if (sha256 != response.sha256){
		res.status(401).send("Wrong Password")
		return
	}

	const count = await checkReuse(newpass)

	if (count > 0) {
		res.status(400).send("Password has been used")
		return
	}

	const id = response.id

	response.sha256 = createHash("sha256").update(newpass).digest("hex")
	response.sha1 = createHash("sha1").update(newpass).digest("hex")

	await pb.collection("Nexgen").update(id, response)

	response = await axios.get(`http://localhost:5000/strength?password=${newpass}`)
	let score
	if(response.data === "Strong") {
		score = 10
	} else if (response.data === "Medium") {
		score = 7
	} else {
		score = 3
	}

	response = await pb.collection("strength").getFirstListItem(`username="${username}"`)
	const new_id = response.data.id

	await pb.collection("strength").update(id, {score: score})

	res.send("Done")
})

app.get("/updatescore", async (req, res) => {
	const {newpass} = req.query
	const {username} = req.query
	const currentscorearr = await pb.collection("strength").getFullList()
	let score = currentscorearr[0].score

	const strength = await axios.get(`http://localhost:5000/strength?password=${newpass}`)

	if (strength.data === "Strong") {
		score = 10
	}else if (strength.data === "Medium") {
		score = 7
	}else if (strength.data === "Weak"){
		score = 3
	}

	await pb.collection("strength").update(currentscorearr[0].id, {"score": score})
})

app.get('/checkcommon', (req, res) => {
	const {password} = req.query;
	console.log("common")

	if (!password) {
		return res.status(400).json({message: 'Password is required'});
	}

	const hashedPassword = createHash('sha256').update(password).digest('hex');
	if (hashedCommonPasswords.has(hashedPassword)) {
		return res.json({message: 'Your password is too common. Please change it!'});
	}

	const fuzzyResult = fuse.search(password);
	if (fuzzyResult.length > 0) {
		return res.json({message: 'Your password is very similar to common passwords. Please consider changing it'});
	}else{
		return res.json({message: 'Good to go!'});
	}
})

app.post('/register-company', async (req, res) => {
    const {
        company_name,
        minimum_length,
        no_of_capital_letters,
        no_of_special_characters,
        no_of_numbers,
        prefix,
        suffix,
        no_of_small_letters,
        patterns_to_be_present,
        anti_patterns
    } = req.body;

    // Validate request body
    if (
        typeof company_name === 'string' &&
        typeof minimum_length === 'number' &&
        typeof no_of_capital_letters === 'number' &&
        typeof no_of_special_characters === 'number' &&
        typeof no_of_numbers === 'number' &&
        (prefix=== null || typeof prefix === 'string') &&
        (suffix === null || typeof suffix === 'string') &&
        typeof no_of_small_letters === 'number' &&
        Array.isArray(patterns_to_be_present) &&
        Array.isArray(anti_patterns)
    ) {
        try {
            const values = {
				"company_name": company_name,
				"minimum_length": minimum_length,
				"no_of_capital_letters": no_of_capital_letters,
				"no_of_special_characters": no_of_special_characters,
				"no_of_numbers": no_of_numbers,
				"prefix": prefix,
				"suffix": suffix,
				"no_of_small_letters": no_of_small_letters,
				"patterns_to_be_present": {array: patterns_to_be_present},
				"anti_patterns": {array: patterns_to_be_present}
			};

            await pb.collection("company_params").create(data);
            res.status(200).json({ message: 'Validation successful and data inserted!' });
        } catch (error) {
            console.error('Database insertion error:', error);
            res.status(500).json({ error: 'Failed to insert data into the database.' });
        }
    } else {
        console.log('Invalid request body structure.');
        res.status(400).json({ error: 'Invalid request body.' });
    }
});

// app.get('/validatetext', async (req, res) => {
//     const { plaintext } = req.query;
// 	const company_name = "Infosys"

//     if (typeof company_name !== 'string' || typeof plaintext !== 'string') {
//         return res.status(400).json({ error: 'Invalid input' });
//     }

//     try {
//         const result = await pool.query('SELECT * FROM company_params WHERE company_name = $1', [company_name]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Company not found' });
//         }

//         const params = result.rows[0];

//         // Check length
//         if (plaintext.length < params.minimum_length) {
//             return res.status(400).json({ error: 'Plaintext length is insufficient' });
//         }

//         // Check capital letters
//         const capitalCount = (plaintext.match(/[A-Z]/g) || []).length;
//         if (capitalCount < params.no_of_capital_letters) {
//             return res.status(400).json({ error: 'Insufficient capital letters' });
//         }

//         // Check special characters
//         const specialCount = (plaintext.match(/[^a-zA-Z0-9]/g) || []).length;
//         if (specialCount < params.no_of_special_characters) {
//             return res.status(400).json({ error: 'Insufficient special characters' });
//         }

//         // Check numbers
//         const numberCount = (plaintext.match(/[0-9]/g) || []).length;
//         if (numberCount < params.no_of_numbers) {
//             return res.status(400).json({ error: 'Insufficient numbers' });
//         }

//         // Check small letters
//         const smallCount = (plaintext.match(/[a-z]/g) || []).length;
//         if (smallCount < params.no_of_small_letters) {
//             return res.status(400).json({ error: 'Insufficient small letters' });
//         }

//         // Check prefix
//         if (params.prefix && !plaintext.startsWith(params.prefix)) {
//             return res.status(400).json({ error: 'Plaintext does not start with the required prefix' });
//         }

//         // Check suffix
//         if (params.suffix && !plaintext.endsWith(params.suffix)) {
//             return res.status(400).json({ error: 'Plaintext does not end with the required suffix' });
//         }

//         // Check patterns to be present
//         for (const pattern of params.patterns_to_be_present) {
//             const regex = new RegExp(pattern);
//             if (!regex.test(plaintext)) {
//                 return res.status(400).json({ error: `Missing required pattern: ${pattern}` });
//             }
//         }

//         // Check anti-patterns
//         for (const pattern of params.anti_patterns) {
//             const regex = new RegExp(pattern);
//             if (regex.test(plaintext)) {
//                 return res.status(400).json({ error: `Forbidden pattern found: ${pattern}` });
//             }
//         }

//         console.log('Plaintext validation passed.');
//         res.status(200).json({ message: 'Plaintext validation passed' });
//     } catch (error) {
//         console.error('Database error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// })

app.get('/validatetext', async (req, res) => {
	console.log('validate')
    const { company_name, plaintext } = req.query;

    if (typeof company_name !== 'string' || typeof plaintext !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

	try {
		const result = await pb.collection("company_params").getFirstListItem(`company_name="${company_name}"`)
        if (!result) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const params = result

        // Check length
        if (plaintext.length < params.minimum_length) {
            return res.status(400).json({ error: 'Plaintext length is insufficient' });
        }

        // Check capital letters
        const capitalCount = (plaintext.match(/[A-Z]/g) || []).length;
        if (capitalCount < params.no_of_capital_letters) {
            return res.status(400).json({ error: 'Insufficient capital letters' });
        }

        // Check special characters
        const specialCount = (plaintext.match(/[^a-zA-Z0-9]/g) || []).length;
        if (specialCount < params.no_of_special_characters) {
            return res.status(400).json({ error: 'Insufficient special characters' });
        }

        // Check numbers
        const numberCount = (plaintext.match(/[0-9]/g) || []).length;
        if (numberCount < params.no_of_numbers) {
            return res.status(400).json({ error: 'Insufficient numbers' });
        }

        // Check small letters
        const smallCount = (plaintext.match(/[a-z]/g) || []).length;
        if (smallCount < params.no_of_small_letters) {
            return res.status(400).json({ error: 'Insufficient small letters' });
        }

        // Check prefix
        if (params.prefix && !plaintext.startsWith(params.prefix)) {
            return res.status(400).json({ error: 'Plaintext does not start with the required prefix' });
        }

        // Check suffix
        if (params.suffix && !plaintext.endsWith(params.suffix)) {
            return res.status(400).json({ error: 'Plaintext does not end with the required suffix' });
        }

        // Check patterns to be present
		if (params.patterns_to_be_present) {
			for (const pattern of params.patterns_to_be_present.array) {
				const regex = new RegExp(pattern);
				if (!regex.test(plaintext)) {
					return res.status(400).json({ error: `Missing required pattern: ${pattern}` });
				}
			}
		}

        // Check anti-patterns
		if (params.anti_patterns) {
			for (const pattern of params.anti_patterns.array) {
				const regex = new RegExp(pattern);
				if (regex.test(plaintext)) {
					return res.status(400).json({ error: `Forbidden pattern found: ${pattern}` });
				}
			}
		}

        console.log('Plaintext validation passed.');
        res.status(200).json({ message: 'Plaintext validation passed' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/strengthscore", async (req, res) => {
	const allusers = await pb.collection("strength").getFullList()

	const max = allusers.length * 10

	let total = 0

	for (let i=0; i<allusers.length; i++) {
		total += allusers[i].score
	}

	console.log(max, total)

	const final = math.round((total / max) * 100)

	res.send(final.toString())

})

app.get("/compromised", async (req, res) => {
	const allusers = await pb.collection("Nexgen").getFullList()

	let count = 0

	for (let i=0; i<allusers.length; i++){
		const response = await checkCompromised(allusers[i].sha1)
		count += response.isCompromised ? 1 : 0
	}

	res.send(count.toString())
})

app.listen(PORT, () => {
	console.log(`Serving on http://localhost:${PORT}`)
})
