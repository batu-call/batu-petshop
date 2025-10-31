import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"



const page = () => {
  return (
    <div>
      <div className='w-full h-30 bg-primary shadow-xl'>
        <Link href={"/main"}>
      <div className='fixed'>
        <Image  src={"/logo.png"} alt='main-icon' width={500} height={500} className='flex justify-center items-center w-40 h-40'/>
      </div>
      </Link>
              <div className='ml-12'>
        <Button className='absolute'>Button</Button>
      </div>
      </div>
      <div className='flex gap-20 items-center justify-center absolute right-20'>
        <div className='w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Users</h3>
        </div>
        <div className='w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Products</h3>
        </div>
        <div className='w-50 h-7 rounded-xl bg-secondary'>
        <h3 className='items-center flex justify-center text-color text-jost'>Orders</h3>
        </div>
      </div>
    </div>
  )
}

export default page