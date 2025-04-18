"use client"

import { Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  const handleSignIn = async () => {
    try {
      console.log('Starting Google sign-in...');
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
    }
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "OAuthCallback":
        return "There was a problem with the Google sign-in. This could be due to incorrect OAuth configuration or network issues. Please try again."
      case "OAuthSignin":
        return "Error starting the Google sign-in process. Please try again."
      case "OAuthAccountNotLinked":
        return "This email is already associated with another sign-in method."
      case "AccessDenied":
        return "Access was denied. Please make sure to grant the necessary permissions."
      case "Configuration":
        return "There is a problem with the server configuration. Please contact support."
      default:
        return errorDescription || "An unexpected error occurred during sign in."
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Welcome</h1>
      <p className="text-gray-600">Sign in to access your dashboard</p>
      {error && (
        <div className="text-sm text-red-500 space-y-1">
          <p className="font-medium">{getErrorMessage(error)}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs opacity-75">Error code: {error}</p>
          )}
        </div>
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