import React from 'react'
import LoginForm from '../../components/loginForm/LoginForm'
import Title from '../../components/title/Title'
import TestBackendAuth from '../../components/testBackendAuth/TestBackendAuth'

function LoginPage() {
  return (
    <div>
      <Title />
      <LoginForm />
    </div>
  )
}

export default LoginPage