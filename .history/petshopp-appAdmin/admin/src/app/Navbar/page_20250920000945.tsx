import React from 'react'
import Link from 'next/link'
import Image from 'next/image'



const page = () => {
  return (
    <div>
        <Link href={"/main"}>
      <div className='w-full h-30 bg-primary shadow-xl'>
      <div className='fixed'>
        <Image  src={"/logo.png"} alt='main-icon' width={500} height={500} className='flex justify-center items-center w-40 h-40'/>
      </div>
      <div className='flex gap-20 items-center justify-center'>
        <div className='bg-amber-50 w-50 h-7 items-center justify-center'>
        <h3>am.sjbfk;jasf</h3>
        </div>
        <div className='bg-amber-50 w-50 h-7'>
        <h3>alsjbfhk;ljbasf</h3>
        </div>
        <div className='bg-amber-50 w-50 h-7'>
        <h3>alsfn;lnkasf</h3>
        </div>
      </div>
      </div>
      </Link>
    </div>
  )
}

export default page