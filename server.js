const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 4000;

// CORS 설정: 특정 출처 허용
app.use(cors({
    origin: 'https://tlatms6077.github.io',
    optionsSuccessStatus: 200
}));

// JSON 바디 파싱을 위해 미들웨어 추가
app.use(express.json());

const NOTION_API_URL = `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`;
const NOTION_API_KEY = process.env.NOTION_KEY;

app.post('/api/notion-data', async (req, res) => {
    const userEmail = req.body.email; // 클라이언트에서 전송된 이메일 주소
    if (!userEmail) {
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
            return people.some(person => person.person.email === userEmail);
        });

        if (filteredResults.length === 0) {
            return res.status(404).json({ error: 'Invalid email. Please try again.' });
        }

        console.log('Filtered Data:', filteredResults);  // 필터링된 데이터를 로그에 출력
        res.json({ results: filteredResults });
    } catch (error) {
        console.error('Error fetching data from Notion API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
