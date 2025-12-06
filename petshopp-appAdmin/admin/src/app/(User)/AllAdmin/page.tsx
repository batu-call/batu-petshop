"use client"
import React, { useEffect, useState } from 'react'
import Navbar from "@/app/Navbar/page";
import Sidebar from "@/app/Sidebar/page";
import { AdminGuard } from "@/app/Context/AdminGuard";
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'


type Admin = {
    _id : string;
    firstName : string;
    lastName : string;
    email : string;
    phone : string;
    address : string;
    role : string;
    avatar:string; 
}


const AllAdmin = () => {

    const [admin,setAdmin] = useState<Admin[]>([]);


    useEffect(() =>{
     const fetchAdmin = async() =>{
        try {
            const response = await axios.get("http://localhost:5000/api/v1/admin/details",{withCredentials:true})
            if(response.data.success){
                setAdmin(response.data.adminDetails)
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
     }
     fetchAdmin();
    },[])



  const handlerRemove = async(id:string) =>{
  const confirm = window.confirm("Are you sure you want to delete this Admin?")
  if(!confirm) return;
    try {
      const response = await axios.delete(`http://localhost:5000/api/v1/admin/${id}`, {
        withCredentials:true
      })
      if(response.data.success){
        setAdmin(prev => prev.filter(p => p._id !== id))
        toast.success("Deletion completed successfully")
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






  return (
       <div className='bg-primary'>
    <AdminGuard>
      <Navbar />
      <Sidebar/>
      <div className='ml-40 bg-primary  flex-1 h-screen'>
        <div className='w-full h-screen bg-white '>
        <div className='w-full bg-secondary flex gap-2 mt-12 text-color'>
           <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center' >First Name</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Last Name</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Email</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Phone</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Address</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 justify-center items-center'>Role</div>
        </div>
        {admin.length === 0 ? (
          <p className='text-bold text-2xl text-color'>No Admin!</p>
        ) : (
          admin.map((a) =>(
            <div key={a._id} className='flex items-center justify-center gap-2 border-1 border-y-teal-900 relative h-16 shadow-xl border-shadow hover:bg-gray-50 transition-all duration-200'>
              <div className='p-1 w-20 h-12 flex justify-center items-center relative'>
                 {a.avatar && a.avatar.length > 0 ? (
                    <Image 
                        src={a?.avatar || "/default-avatar.png"}
                        alt={`${a.firstName} ${a.lastName}`} 
                        fill 
                        className='rounded-xl object-cover'
                    />
                 ) : (
                    <span>No Image</span>
                 )}
              </div> 
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{a.firstName}</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{a.lastName}</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{a.email}</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost  items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{a.phone}</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost items-center overflow-hidden whitespace-nowrap text-ellipsis justify-start'>{a.address}</div>
              <div className='text-xl p-1 w-120 h-9 flex ml-12 text-jost justify-center items-center'>{a.role}</div>
              <p className='hover:translate-y-1 cursor-pointer absolute right-0' onClick={() => {handlerRemove(a._id)}}><Image src={"/trash.png"} alt='trash-button' width={30} height={30}/></p>
            </div>
          ))
        )}
      </div>
      </div>

    </AdminGuard>
    </div>
  )
}

export default AllAdmin