import React from 'react';
import { FaHeart, FaGem, FaCrown } from 'react-icons/fa';

function UserTitleBox({ user, tier }) {
  let icon;

  switch (tier) {
    case 5:
      icon = <FaGem className="text-blue-500 inline-block" />;
      break;
    case 6:
      icon = <FaCrown className="text-yellow-500 inline-block" />;
      break;
    case 7:
      icon = <FaCrown className="text-yellow-500 inline-block" />;
      break;
    default:
      icon = null;
      break;
  }

  return (
    <span className='absolute top-0 leading-none -translate-y-1/4 inline-flex'>
      {user.title ? (
        <span className='bg-red-500 text-white text-micro font-semibold ml-1 px-1 py-superTiny leading-tight rounded uppercase'>
          {user.title}
        </span>
      ) : null}

      {tier > 4 ? (
        <span className=' bg-white text-micro font-semibold ml-1 px-1 py-superTiny leading-tight rounded uppercase'>
          {icon}
        </span>
      ) : user.siteTitle ? (
        <span className='bg-purple-500 text-white text-micro font-semibold ml-1 px-1 py-superTiny leading-tight rounded uppercase'>
          {user.siteTitle}
        </span>
      ) : null}
    </span>
  );
}

export default UserTitleBox;
