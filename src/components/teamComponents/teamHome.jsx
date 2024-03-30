import React from 'react'
import { FaHouseUser } from 'react-icons/fa';

function TeamHome({setActiveTab}) {
    const tabs = [
        { id: 'dbUsers', label: 'DB Users' },
        { id: 'dbGames', label: 'DB Games' },
        { id: 'dbForum', label: 'DB Forum' },
        { id: 'dbQuestions', label: 'DB Questions' },
        { id: 'reviewGames', label: 'Review Games' },
        { id: 'editUser', label: 'Edit User' },
        { id: 'editGame', label: 'Edit Game' }
      ];
  return (
    <>
    <div className='flex justify-between items-center w-full px-32 text-3xl text-white py-12'>
    <div><FaHouseUser className=' cursor-pointer hover:text-purple-500 duration-1000' onClick={()=>{setActiveTab("teamHome")}}/></div>
    <div className='text-center'>Home Page</div>
    <div className='opacity-0'><FaHouseUser/></div>
</div>
    <div className=' px-12 text-white'>
        

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className="bg-gray-700 hover:bg-gray-600 cursor-pointer p-4 rounded-lg transition duration-200 ease-in-out"
          onClick={() => setActiveTab(tab.id)}
        >
          <h2 className="text-purple-500 text-center text-xl">{tab.label}</h2>
        </div>
      ))}
    </div>
    </div></>
  )
}

export default TeamHome