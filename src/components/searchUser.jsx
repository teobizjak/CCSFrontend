import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplaySearchedUserComponent from './displaySearchedUser';

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length > 0) {
        try {
          const response = await axios.get(`/search?query=${query}`);
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching data: ', error);
        }
      } else {
        setUsers([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className='container mx-auto p-4'>
      <h2 className="mb-2 text-xl font-semibold text-purple-400">Search user</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded border-purple-300 bg-gray-800 text-white p-2 w-full outline-none focus:border-purple-500"
        placeholder="Enter address or name..."
      />
      <div>
        {users.map((user, index) => (
          <DisplaySearchedUserComponent
            key={user._id}
            user={user}
            className={`bg-gray-800 text-white border border-gray-700 my-2 p-2 rounded hover:bg-gray-700 transition duration-200 ease-in-out transform hover:-translate-y-1`}
            style={{
              animationDelay: `${index * 0.1}s`, // For staggering the appearance of search results
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;
