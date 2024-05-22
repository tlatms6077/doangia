const axios = require('axios');

module.exports = async (req, res) => {
  const { email } = req.body;
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
      return people.some(person => person.person.email === email);
    });

    if (filteredResults.length === 0) {
      return res.status(404).json({ error: '잘못된 이메일입니다. 다시 입력해주세요.' });
    }

    res.json({ results: filteredResults });
  } catch (error) {
    console.error('Error fetching data from Notion API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
};
