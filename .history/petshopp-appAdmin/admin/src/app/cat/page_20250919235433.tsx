import React from 'react'
import Navbar from '../Navbar/page'
import Sidebar from '../Sidebar/page'

const page = () => {
  return (
    <div>
      <div className='fixed'>
      <Navbar />
      <Sidebar />
      </div>
      <div className='ml-12 bg-amber-200 w-full h-screen'>

      </div>
    </div>
  )
}

export default page