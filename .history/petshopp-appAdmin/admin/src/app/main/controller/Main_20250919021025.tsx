import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-primary'>
      <div className='w-50 h-screen bg-white fixed'>
        {/* Cat */}
      <div className='bg-primary inline-block p-2 ml-6 mt-5 rounded-2xl'>
        <div className='flex gap-2'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={50}
       width={50}
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