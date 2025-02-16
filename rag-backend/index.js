const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const app = express();
const cors = require("cors");
app.use(cors());
const PORT = 3000;


app.use(express.json());
PGHOST='ep-mute-boat-a53qmt0d-pooler.us-east-2.aws.neon.tech'
PGDATABASE='trial'
PGUSER='trial_owner'
PGPASSWORD='pfUPK60AktIV'

const pool = new Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: 5432,
    ssl: {require: true}
});

app.get('/', (req, res) => {

    res.send('Hello World!');
});


//POST endpoint to insert company parameters
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
