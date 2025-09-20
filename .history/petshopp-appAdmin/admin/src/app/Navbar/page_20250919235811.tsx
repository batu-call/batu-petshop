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
      </div>
      </Link>
    </div>
  )
}

export default page