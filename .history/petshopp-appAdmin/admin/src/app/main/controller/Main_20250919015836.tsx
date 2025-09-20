import React from 'react'
import Image from 'next/image'

const Main = () => {
  return (
    <div className='w-full h-screen bg-amber-100' >
      <div>
       <Image src={"/cat_7721779.png"} alt='cat-image'/>
      </div>
    </div>
  )
}

export default Main