const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const Fuse = require('fuse.js');
const app = express();
const cors = require("cors");
app.use(cors());
const PORT = 3000;

app.use(express.json());
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




// Read and store common passwords
const commonPasswords = fs.readFileSync('commonpasswords.txt', 'utf-8')
  .split('\n')
  .map(password => password.trim())
  .filter(password => password);

// Hash the common passwords
const hashedCommonPasswords = new Set(
  commonPasswords.map(password => crypto.createHash('sha256').update(password).digest('hex'))
);

// Initialize Fuse.js for fuzzy matching
const fuse = new Fuse(commonPasswords, { threshold: 0.2 }); // 0.2 corresponds to about 80% similarity

// Check password API
app.get('/checkcommon', (req, res) => {
  const {password} = req.query;
  console.log(password);
  if (!password) {
    return res.status(400).json({message: 'Password is required'});
  }

  // Hash and check exact match
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if (hashedCommonPasswords.has(hashedPassword)) {
    return res.json({message: 'Your password is too common. Please change it!'});
  }

  // Check fuzzy similarity
  const fuzzyResult = fuse.search(password);
  if (fuzzyResult.length > 0) {
    return res.json({message: 'Your password is very similar to common passwords. Please consider changing it'});
  }

  return res.json({message: 'Good to go!'});
});





// Middleware to parse JSON request bodies
app.use(express.json());
app.get('/', (req, res) => {

    res.send('Hello World!');
});
// POST endpoint to insert company parameters
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
            const query = `INSERT INTO company_params (
                company_name, minimum_length, no_of_capital_letters, no_of_special_characters, no_of_numbers, prefix, suffix, no_of_small_letters, patterns_to_be_present, anti_patterns
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

            const values = [
                company_name, minimum_length, no_of_capital_letters, no_of_special_characters, no_of_numbers, prefix, suffix, no_of_small_letters, patterns_to_be_present, anti_patterns
            ];

            await pool.query(query, values);
            console.log('Request body is valid, data inserted into the database.');
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

// GET endpoint to validate plaintext against company parameters
app.get('/validate-text', async (req, res) => {
    const { company_name, plaintext } = req.query;

    if (typeof company_name !== 'string' || typeof plaintext !== 'string') {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        const result = await pool.query('SELECT * FROM company_params WHERE company_name = $1', [company_name]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const params = result.rows[0];

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
        for (const pattern of params.patterns_to_be_present) {
            const regex = new RegExp(pattern);
            if (!regex.test(plaintext)) {
                return res.status(400).json({ error: `Missing required pattern: ${pattern}` });
            }
        }

        // Check anti-patterns
        for (const pattern of params.anti_patterns) {
            const regex = new RegExp(pattern);
            if (regex.test(plaintext)) {
                return res.status(400).json({ error: `Forbidden pattern found: ${pattern}` });
            }
        }

        console.log('Plaintext validation passed.');
        res.status(200).json({ message: 'Plaintext validation passed' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/check-password', async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    try {
        const url = 'https://github.com/danielmiessler/SecLists/blob/master/Passwords/Common-Credentials/10-million-password-list-top-10000.txt';
        const response = await axios.get(url);
        const commonPasswords = response.data.split('\n');

        const isCommon = commonPasswords.includes(password);

        if (isCommon) {
            res.json({ message: 'Password is too common. Please choose a stronger password.' });
        } else {
            res.json({ message: 'Password is safe.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to check password' });
    }
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
