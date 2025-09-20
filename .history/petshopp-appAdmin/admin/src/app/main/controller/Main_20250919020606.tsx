import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-amber-100'>
      <div className='w-50 h-screen bg-white fixed'>
      <div className='bg-primary inline-block p-2 m-5'>
        <div className='flex gap-2'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={55}
       width={55}
       />
       <h2 className='text-2xl mt-3'>Cat</h2>
      </div>
      </div>
    </div>
    </div>
  )
}

export default Main