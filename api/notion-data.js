const axios = require('axios');

module.exports = async (req, res) => {
  // 본문 파싱
  let body = "";
  req.on('data', chunk => {
    body += chunk.toString(); // 데이터 조각을 문자열로 변환하여 더합니다.
  });
  req.on('end', async () => {
    try {
      body = JSON.parse(body); // JSON 형식으로 파싱합니다.
      const { email } = body;
      
      const NOTION_API_URL = `https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`;
      const NOTION_API_KEY = process.env.NOTION_KEY;
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
        return res.status(404).json({ error: '잘못된 이메일입니다. 다시 입력해주세요.' });
      }

      res.json({ results: filteredResults });
    } catch (error) {
      console.error('Error fetching data from Notion API:', error);
      res.status(500).json({ error: error.toString() });
    }
  });
};
