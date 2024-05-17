import React, { useState } from 'react';
import axios from 'axios';

const EmailLogin = () => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/notion-data', { email });
      console.log(response.data); // 데이터 처리
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button onClick={handleEmailSubmit}>Submit Email</button>
    </div>
  );
};

export default EmailLogin;
