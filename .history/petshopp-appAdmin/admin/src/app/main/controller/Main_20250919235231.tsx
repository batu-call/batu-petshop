import React from 'react'
import Navbar from '../../Navbar/page'
import Sidebar from '../../Sidebar/page'



const Main = () => {  
  return (
    <div className='w-full h-screen bg-primary'>
      {/* Navbar */}
      <Navbar />
      {/* Catgeory */}
      <Sidebar />
    </div>
  )
}

export default Main