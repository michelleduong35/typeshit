'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { user, profile, signOut, isAuthenticated, isAdmin } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              Bathroom Finder
            </Link>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm">
                    {profile?.full_name || user?.email}
                    {isAdmin && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-10 w-48 py-2 mt-2 bg-white rounded-md shadow-xl z-20">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        signOut()
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  onClick={() => localStorage.setItem('isSignUp', 'true')}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 