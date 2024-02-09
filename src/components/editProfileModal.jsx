import React, { useState } from 'react';
import ProfilePhoto from './profilePhoto';
import checkmarkSVG from '../assets/checkmark.svg';

const EditProfileModal = ({ isEditOpen, setIsEditOpen, user, setUser, axios, publicKey }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [bio, setBio] = useState(user.bio);
  const [selectedPicture, setSelectedPicture] = useState(user.picture);

  const pictures = [
    'avatar', // Replace these with your actual image paths
    'blondeBoy',
    'girl',
    'blondeGirl',
    'rabbit',
    'god',
  ];  
  // ...

  const handleSelectPicture = (pic) => {
    setSelectedPicture(pic);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    let userData = {
      firstName: firstName?.trim() ?? "",
      lastName: lastName?.trim() ?? "",
      bio: bio?.trim() ?? "",
      picture: selectedPicture,
    }
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
    console.dir(userData)
    const token = localStorage.getItem(`token-${publicKey.toString()}`)
    axios.put(`/user/${publicKey}`, userData, {headers: {
        'Authorization': `Bearer ${token}` // pass the token in the Authorization header
      }})
      .then(response => {
        console.log('Updated user:', response.data);
      })
      .catch(error => {
        console.error('Error updating user:', error);
      });
    setIsEditOpen(false);
  };

  const handleClose = () => {
    setIsEditOpen(false);
  };

  if (!isEditOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-80 flex justify-center items-center">
      <div className="relative bg-gray-800 text-white p-6 rounded-lg shadow-lg">
        <span className="absolute top-0 right-0 p-4">
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">&times;</button>
        </span>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="first-name" className="block text-purple-400 text-sm font-bold mb-2">First Name</label>
            <input
              type="text"
              id="first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="last-name" className="block text-purple-400 text-sm font-bold mb-2">Last Name</label>
            <input
              type="text"
              id="last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-purple-400 text-sm font-bold mb-2">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded w-full py-2 px-3 text-white"
            />
          </div>
          <div className="mb-4">
      <span className="block text-purple-400 text-sm font-bold mb-2">Choose your avatar</span>
      <div className="grid grid-cols-3 gap-4">
        {pictures.map((pic, index) => (
          <div key={index} className="relative">
            <button
              type="button"
              className="focus:outline-none"
              onClick={() => handleSelectPicture(pic)}
            >
              <ProfilePhoto
                src={pic}
                className={`w-16 h-16 rounded-full ${selectedPicture === pic ? 'opacity-50' : 'opacity-100'}`}
              />
              {selectedPicture === pic && (
                <img
                src={checkmarkSVG}
                alt="Selected"
                className="absolute inset-0 m-auto"
                style={{ width: '50%', height: '50%' }}
              />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-600">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Save
            </button>
            <button
              className="text-purple-400 hover:text-white"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
