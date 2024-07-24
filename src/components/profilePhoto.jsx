import React, { useEffect, useState } from 'react';
import avatar from '../assets/avatar.png';
import unknown from '../assets/unknown.png'
import rabbit from '../assets/rabbit.png'
import god from '../assets/god.png'
import blondeGirl from '../assets/blondeGirl.png'
import blondeBoy from '../assets/blondeBoy.png'
import girl from '../assets/girl.png'

const images = {
  avatar: avatar,
  unknown: unknown,
  rabbit: rabbit,
  god: god,
  blondeGirl: blondeGirl,
  blondeBoy: blondeBoy,
  girl: girl,
  // ... add all your images here
};

function ProfilePhoto({ src, className, bgColor }) {
  const [srcOfImage, setSrcOfImage] = useState(images[src]);

  useEffect(() => {
    if(src == ""){
      setSrcOfImage(images["avatar"]);
    }else{
      setSrcOfImage(images[src]);
    }
    
  }, [src]);

  return (
    <div className={` p-tiny rounded-full ${bgColor}`}>
      <div className=" rounded-full"> {/* Ensuring the image is fully rounded with a slight white border */}
        <img className={`${className} rounded-full`} src={srcOfImage} alt="Profile" />
      </div>
    </div>
  );
}

export default ProfilePhoto;
