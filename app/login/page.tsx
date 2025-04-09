"use client"

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
        <p className="text-gray-600">Sign in to access your dashboard</p>
        <button
          onClick={() => signIn("google")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}