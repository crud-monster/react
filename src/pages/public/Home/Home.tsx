import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return <main className="page">
    <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 sm:px-12">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-indigo-600">React + TypeScript starter</p>
      <h1 className="max-w-2xl text-4xl sm:text-5xl">CRUD Monster React</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">Authentication, roles and CRUD administration. A foundation you can make your own.</p>
      <div className="mt-8 flex flex-wrap gap-4"><Link className="rounded-md bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700" to="/register">Create an account</Link><Link className="rounded-md border border-slate-300 px-5 py-3 font-medium" to="/login">Sign in</Link></div>
    </section>
    <section className="mt-10 grid gap-6 sm:grid-cols-3" aria-label="Starter features">
      {[['Authentication', 'Login, registration, password reset and email verification.'], ['Administration', 'Manage users, roles and protected application screens.'], ['Your application', 'Reusable lists and editors, styled with Tailwind CSS.']].map(([title, text]) => <article key={title} className="rounded-xl border border-slate-200 bg-white p-6"><h2>{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{text}</p></article>)}
    </section>
    <footer className="mt-10 flex flex-wrap items-center gap-5 text-sm"><span className="text-slate-500">Learn more:</span><a href="https://graphql.org/learn/" target="_blank" rel="noopener noreferrer">GraphQL</a><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React</a><a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">Tailwind CSS</a></footer>
  </main>
}

export default Home
