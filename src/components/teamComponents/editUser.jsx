import React from 'react'
import { FaHouseUser } from 'react-icons/fa'
import SearchUserEdit from './searchUserEdit'

function EditUser({setActiveTab, token}) {
  return (
    <>
    <div className='flex justify-between items-center w-full px-32 text-3xl text-white py-12'>
                <div><FaHouseUser className=' cursor-pointer hover:text-purple-500 duration-1000' onClick={() => { setActiveTab("teamHome") }} /></div>
                <div className='text-center'>Edit User</div>
                <div className='opacity-0'><FaHouseUser /></div>
            </div>
            <SearchUserEdit token={token}/>
    </>
  )
}

export default EditUser