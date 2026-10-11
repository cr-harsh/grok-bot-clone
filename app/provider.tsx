"use client"
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios';

function provider({children} : {children : React.ReactNode}){
  const {data} = useSession();

  useEffect(() => {
    data?.user?.email && createNewUser()
  },[data])

  const createNewUser = async() => {
    const result = await axios.post('/api/user', {});
    console.log(result.data)
  }
  return (
    <div>{children}</div>
  )
}

export default provider