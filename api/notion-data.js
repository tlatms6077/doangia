const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.json());

const NOTION_API_URL = `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`;
const NOTION_API_KEY = process.env.NOTION_KEY;

app.post('/api/notion-data', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const response = await axios.post(NOTION_API_URL, {}, {
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });

        const filteredResults = response.data.results.filter(item => {
            const people = item.properties['사람']?.people || [];
            return people.some(person => person.person.email === email);
        });

        if (filteredResults.length === 0) {
            return res.status(404).json({ error: 'Invalid email. Please try again.' });
        }

        res.json({ results: filteredResults });
    } catch (error) {
        console.error('Error fetching data from Notion API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
