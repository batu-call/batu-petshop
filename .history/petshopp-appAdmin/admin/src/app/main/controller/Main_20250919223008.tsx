import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const Main = () => {
  return (
    <div className='w-full h-screen bg-primary'>
      {/* Navbar */}
      <div className='w-full h-25 bg-white shadow-xl '>

      <div>
        <Image  src={"/logo.png"} alt='main-icon' width={80} height={80}/>
      </div>
      </div>
      <div className='w-40 h-screen bg-white fixed'>
        {/* Cat */}
        <Link href={"/Cat"}>
      <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-9 items-center justify-center'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Cat</h2>
      </div>
      </div>
      </Link>
      {/* Dog */}
         <Link href={"/Dog"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-9 items-center justify-center'>
       <Image src="/dog.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Dog</h2>
      </div>
      </div>
      </Link>
      {/* BİRD */}
         <Link href={"/Bird"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-9 items-center justify-center'>
       <Image src="/bird.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Bird</h2>
      </div>
      </div>
      </Link>
      {/* FİSH */}
         <Link href={"/Fish"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-9 items-center justify-center'>
       <Image src="/cat_7721779.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Fish</h2>
      </div>
      </div>
      </Link>
      {/* Reptile */}
         <Link href={"/Reptile"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-3 items-center justify-center'>
       <Image src="/fish.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white mr-2'>Reptile</h2>
      </div>
      </div>
      </Link>
      {/* Rabbit */}
         <Link href={"/Rabbit"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-3 items-center justify-center'>
       <Image src="/rabbit2.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Rabbit</h2>
      </div>
      </div>
      </Link>
      {/* Horse */}
         <Link href={"/Horse"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-3 items-center justify-center'>
       <Image src="/horse.png" alt='cat-image'
       height={40}
       width={40}
       />
       <h2 className='text-2xl text-jost text-white p-1'>Horse</h2>
      </div>
      </div>
      </Link>
      {/* Contact */}
         <Link href={"/Contact"}>
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-3 items-center justify-center'>
       <h2 className='text-2xl text-jost text-white p-1'>Contact</h2>
      </div>
      </div>
      </Link>
      {/* +category */}
       <div className='bg-primary inline-block p-2 items-center mt-6 ml-3 rounded-2xl w-35'>
        <div className='flex gap-3 items-center justify-center'>
       <h2 className='text-2xl text-jost text-white p-1'>+category</h2>
      </div>
      </div>
    </div>
    </div>
  )
}

export default Main