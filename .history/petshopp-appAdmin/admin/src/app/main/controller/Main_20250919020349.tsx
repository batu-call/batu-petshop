import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-amber-100' >
      <div className='bg-amber-600 inline-block p-2'>
        <div className='flex gap-2'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={45}
       width={45}
       />
       <h2 className='text-2xl'>Cat</h2>
      </div>
      </div>
    </div>
  )
}

export default Main