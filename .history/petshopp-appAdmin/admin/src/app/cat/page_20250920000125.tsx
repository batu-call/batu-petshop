import React from 'react'
import Navbar from '../Navbar/page'
import Sidebar from '../Sidebar/page'

const page = () => {
  return (
    <div>
      <div className=''>
      <Navbar />
      <div className='fixed'>
      <Sidebar/>
      </div>
      </div>
      <div className='ml-40 bg-amber-200  flex-1 h-screen'>

      </div>
    </div>
  )
}

export default page