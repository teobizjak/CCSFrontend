import React from 'react'

function UserTitleBox({user}) {
    return (
        <span className='absolute top-0 leading-none -translate-y-1/4'>
            {user.title ? <span
                className='bg-red-500 text-white text-micro font-semibold ml-2 px-1 py-superTiny leading-tight rounded uppercase'
            >{user.title}</span> : ''}

            {user.siteTitle ? <span
                className='bg-purple-500 text-white text-micro font-semibold ml-2 px-1 py-superTiny leading-tight rounded uppercase'
            >{user.siteTitle}</span> : ''}
        </span>
    )
}

export default UserTitleBox