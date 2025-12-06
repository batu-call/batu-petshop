"use client"
import React, { useEffect, useState } from 'react'
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import CircularText from '@/components/CircularText';


type User = {
    _id : string;
    firstName : string;
    lastName : string;
    email : string;
    phone : string;
    address : string;
    role : string;
    avatar:string; 
}


const AllUsers = () => {

    const [user,setUser] = useState<User[]>([]);
    const [loading,setLoading] = useState(true);

    useEffect(() =>{
     const fetchUser = async() =>{
      setLoading(true)
        try {
            const response = await axios.get("http://localhost:5000/api/v1/user/users",{withCredentials:true})
            if(response.data.success){
                setUser(response.data.getUser)
            }
        } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("xfghdxfgjdxfg!");
      }
    }
    finally {
      setLoading(false)
    }
     }
     fetchUser();
    },[])



  const handlerRemove = async(id:string) =>{
  const confirm = window.confirm("Are you sure you want to delete this user?")
  if(!confirm) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/v1/user/${id}`, {
        withCredentials:true
      })
      if(response.data.success){
        setUser(prev => prev.filter(p => p._id !== id))
      }
    } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message || "Unexpected error");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Unexpected error!");
    }
  }
 }



if (loading) {
    return (
      <>
        <Navbar />
        <Sidebar />
        <div className="ml-40 fixed inset-0 flex justify-center items-center bg-primary z-50">
          <CircularText
            text="LOADING"
            spinDuration={20}
            className="text-white text-4xl"
          />
        </div>
      </>
    );
  }





  return (
       <div className='bg-primary'>
    <AdminGuard>
      <Navbar />
      <Sidebar/>
      <div className='ml-40 bg-primary flex-1 h-screen'>
        <div className='w-full h-screen bg-white'>
        <div className='w-full bg-secondary flex gap-2 mt-12 text-color'>
           <div className='text-xl p-1 w-120 h-9 flex justify-center items-center' >First Name</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Last Name</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Email</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-13 justify-center items-center'>Phone</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Address</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Role</div>
        </div>
        {user.length === 0 ? (
          <p className='text-bold text-2xl text-color'>No User!</p>
        ) : (
          user.map((u) =>(
            <Link href={`userDetails/${u._id}`} className='' key={u._id}>
            <div className='flex items-center justify-center gap-2 border-1 border-y-teal-900 relative h-16 shadow-xl border-shadow hover:bg-gray-50 transition-all duration-200'>
              <div className='p-1 w-20 h-12 flex justify-center items-center relative'>
                 {u.avatar && u.avatar.length > 0 ? (
                    <Image 
                        src={u?.avatar || "/default-avatar.png"}
                        alt={`${u.firstName} ${u.lastName}`} 
                        fill 
                        className='rounded-xl object-cover'
                    />
                 ) : (
                    <span>No Image</span>
                 )}
              </div> 
              <div className='text-md p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{u.firstName}</div>
              <div className='text-md p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{u.lastName}</div>
              <div className='text-md p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{u.email}</div>
              <div className='text-md p-1 w-120 h-9 flex ml-25 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{u.phone}</div>
              <div className='text-md p-1 w-120 h-9 flex ml-12 text-jost items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{u.address}</div>
              <div className='text-md p-1 w-120 h-9 flex ml-12 text-jost justify-center items-center'>{u.role}</div>
              <p className='hover:translate-y-1 cursor-pointer absolute right-0' onClick={() => {handlerRemove(u._id)}}><Image src={"/trash.png"} alt='trash-button' width={30} height={30}/></p>
            </div>
            </Link>
          ))
        )}
      </div>
      </div>

    </AdminGuard>
    </div>
  )
}

export default AllUsers