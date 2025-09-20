import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-amber-100' >
      <div className='flex'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={35}
       width={35}
       />
       <h2 className='h-12'>Cat</h2>
      </div>
    </div>
  )
}

export default Main