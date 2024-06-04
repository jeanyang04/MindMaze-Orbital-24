import React, { useState } from 'react'
import { doSignOut } from '../../firebase/auth'
import { useNavigate } from 'react-router-dom'
import TestBackendAuth from '../../components/testBackendAuth/TestBackendAuth'
import { AuthTokenProp } from '../../types/auth'
import { useAuth } from '../../contexts/AuthProvider'

function HomePage() {

  const [errMessage, setErrMessage] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()

  const { token } = useAuth()
  const onSignOut = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSigningOut) {
      setIsSigningOut(true)
      try {
        await doSignOut();
        navigate('/login')
      } catch (error) {
        if (error instanceof Error) {
          setErrMessage(error.message)
        }
        setIsSigningOut(false) // Reset signing-in state
      }
    }
  }

  return (
    <>
      <p>Welcome Back!</p>
      <TestBackendAuth token={token}/>
      <button onClick={(e) => onSignOut(e)}> 
        Sign out 
      </button>
    </>
  )
}

export default HomePage