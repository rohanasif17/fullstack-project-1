import React, { useState, useEffect } from 'react';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        setLoading(true);
        fetch(`/api/v1/videos/search?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            setResults(data.results || []);
            setLoading(false);
          })
          .catch(err => {
            console.error('Search error:', err);
            setLoading(false);
          });
      } else {
        setResults([]);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div style={{ padding: '1rem', maxWidth: '500px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search videos"
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc'
        }}
      />

      {loading && <p>Loading...</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {results.map((item, index) => (
          <li key={index} style={{ margin: '10px 0' }}>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchComponent; 