import React, { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/DescribeImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const data = await response.text(); // Change this line
    setDescription(data); // Change this line
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Image URL:
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} required />
        </label>
        <button type="submit">Describe</button>
      </form>
      {description && <p>{description}</p>}
    </div>
  );
}

export default App;
//test