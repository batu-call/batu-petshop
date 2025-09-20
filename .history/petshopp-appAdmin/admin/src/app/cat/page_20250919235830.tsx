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
      <div className='ml-50 bg-amber-200 w-full h-screen'>

      </div>
    </div>
  )
}

export default page