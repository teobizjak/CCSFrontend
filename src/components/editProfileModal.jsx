import React, { useState } from 'react';

function EditProfileModal({ setIsEditOpen, user, setUser, axios, publicKey }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);

  const handleSave = () => {
    console.log("saving new data");
    const updatedUser = { ...user, publicKey, firstName, lastName };
    const token = localStorage.getItem('token'); // get the token from localStorage
    axios.put(`/user/${publicKey}`, updatedUser, {headers: {
        'Authorization': `Bearer ${token}` // pass the token in the Authorization header
      }})
      .then(response => {
        setUser(response.data);
        console.log('Updated user:', response.data);
        setIsEditOpen(false)
      })
      .catch(error => {
        console.error('Error updating user:', error);
      });
  };

  return (
    <div className="fixed py-10 px-8 inset-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="w-3/4 h-3/4 bg-purple-200 relative">
        <button
          className="absolute top-0 right-0 m-2 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
          onClick={() => setIsEditOpen(false)}
        >
          X
        </button>
        <div className=' w-full h-full'>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={firstName ? firstName : "Set your name"} />
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={lastName ? lastName : "Set your last name"} />
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
