import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DisplaySearchedUserComponent from '../displaySearchedUser';
import EditSearchedUser from './editSearchedUser';

const SearchUserEdit = ({token}) => {
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
    <div className='container mx-auto md:p-4'>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border rounded border-purple-300 bg-gray-800 text-white p-2 w-full outline-none focus:border-purple-500"
        placeholder="Enter address or name..."
      />
      <div>
        {users.map((user, index) => (
          <EditSearchedUser
            key={user._id}
            user={user}
            token={token}
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

export default SearchUserEdit;
