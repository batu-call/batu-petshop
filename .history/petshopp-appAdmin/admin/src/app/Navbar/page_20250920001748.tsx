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
      <div className='flex gap-20 items-center justify-center absolute right-20'>
        <div className='bg-amber-50 w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Users</h3>
        </div>
        <div className='bg-amber-50 w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>alsjbfhk;ljbasf</h3>
        </div>
        <div className='bg-amber-50 w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>alsfn;lnkasf</h3>
        </div>
      </div>
    </div>
  )
}

export default page