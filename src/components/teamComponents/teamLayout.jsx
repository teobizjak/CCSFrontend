import React from 'react'
import TeamSidebar from './teamSidebar'
import TeamHeader from './teamHeader'

function TeamLayout({Component, activeTab, setActiveTab, token}) {
  return (
    <div className=' w-full flex'>
        <div className=''><TeamSidebar activeTab={activeTab} setActiveTab={setActiveTab}/></div>
        <div className='grow'><TeamHeader token={token}/><div className=' p-6'><Component token={token}/></div></div>
    </div>
  )
}

export default TeamLayout