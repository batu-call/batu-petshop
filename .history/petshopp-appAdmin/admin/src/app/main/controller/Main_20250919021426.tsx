import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-primary'>
      <div className='w-full h-25 bg-primary shadow-xl '></div>
      <div className='w-40 h-screen bg-white fixed'>
        {/* Cat */}
      <div className='bg-primary inline-block p-2 items-center mt-6 ml-7 rounded-2xl'>
        <div className='flex gap-3'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white mt-2'>Cat</h2>
      </div>
      </div>
      {/* Dog */}
    </div>
    </div>
  )
}

export default Main