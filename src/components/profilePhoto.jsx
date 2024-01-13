import React, { useEffect, useState } from 'react';
import avatar from '../assets/avatar.png';

const images = {
  avatar: avatar,
  // ... add all your images here
};

function ProfilePhoto({src, className}) {
  const [srcOfImage, setSrcOfImage] = useState(images[src]);

  useEffect(() => {
    setSrcOfImage(images[src]); // Use images[src] instead of src
  }, [src]);

  return (
    <img className={className} src={srcOfImage} alt="Profile" />
  );
}

export default ProfilePhoto;
