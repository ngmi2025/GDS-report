"use client"

import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const handleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
      <p className="text-gray-600">Sign in to access your dashboard</p>
      {error && (
        <p className="text-sm text-red-500">
          {error === "OAuthCallback" 
            ? "There was a problem with the Google sign-in. Please try again." 
            : "An error occurred during sign in."}
        </p>
      )}
      <button
        onClick={handleSignIn}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  )
}