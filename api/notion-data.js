const axios = require('axios');

module.exports = async (req, res) => {
    // JSON 본문을 안전하게 파싱
    let body;
    try {
        body = req.body;
        if (typeof body === 'string') {
            body = JSON.parse(body); // 요청 본문이 문자열로 오는 경우, JSON으로 파싱
        }
    } catch (error) {
        console.error('Error parsing request body:', error);
        return res.status(400).json({ error: 'Bad request, invalid JSON' });
    }

    const userEmail = body.email;
    if (!userEmail) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Notion API 요청
    const NOTION_API_URL = `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`;
    const NOTION_API_KEY = process.env.NOTION_KEY;
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
            return res.status(404).json({ error: 'No matching records found.' });
        }

        res.status(200).json({ results: filteredResults });
    } catch (error) {
        console.error('Error fetching data from Notion API:', error);
        res.status(500).json({ error: error.message || 'Error fetching data from Notion.' });
    }
};
