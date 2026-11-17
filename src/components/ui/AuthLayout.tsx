import React from 'react'

interface AuthLayoutProps {
  title: string
  children: React.ReactNode
}

function AuthLayout({ title, children }: AuthLayoutProps) {
  return <main className="page"><section className="auth-card"><h1 className="mb-6">{title}</h1>{children}</section></main>
}

export default AuthLayout
