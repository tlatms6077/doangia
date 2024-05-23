const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 4000;

const allowedOrigins = ['http://localhost:3000', 'https://tlatms6077.github.io'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json()); // JSON 바디 파싱을 위해 추가

const NOTION_API_URL = `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`;
const NOTION_API_KEY = process.env.NOTION_KEY;

app.post('/api/notion-data', async (req, res) => {
    const userEmail = req.body.email; // 클라이언트에서 전송된 이메일 주소
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
            return res.status(404).json({ error: '잘못된 이메일입니다. 다시 입력해주세요.' });
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
