'use client'

import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '@/utils/supabaseClient'
import type { Database } from '@/utils/supabaseClient'
import Link from 'next/link'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { createBathroom } from '@/utils/apiTest'

type Bathroom = Database['public']['Tables']['bathrooms']['Row']

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [building, setBuilding] = useState('')
  const [address, setAddress] = useState('')
  const [floor, setFloor] = useState('')
  const [directions, setDirections] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchBathrooms = async () => {
    try {
      console.log('Fetching bathrooms from Supabase...');
      
      // Use our API endpoint instead of direct Supabase call
      const response = await fetch('/api/bathrooms');
      const data = await response.json();
      
      console.log('Bathrooms data:', data);
      setBathrooms(data.bathrooms || []);
    } catch (err) {
      console.error('Error fetching bathrooms:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if not in auth loading state
    if (!authLoading) {
      fetchBathrooms();
    }
  }, [authLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    
    try {
      // Use the apiTest utility
      const result = await createBathroom({
        name,
        building,
        address,
        floor: floor || undefined,
        directions: directions || undefined
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Clear form and refresh data
      setName('');
      setBuilding('');
      setAddress('');
      setFloor('');
      setDirections('');
      fetchBathrooms();
    } catch (err) {
      console.error('Error adding bathroom:', err);
      setAddError(err instanceof Error ? err.message : 'Failed to add bathroom');
    } finally {
      setAdding(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            Bathroom Finder
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {user ? `Welcome ${user.email}` : 'Welcome to Bathroom Finder'}
            </h2>
            {user ? (
              <p className="text-gray-600">You're logged in and can now add bathrooms and post reviews.</p>
            ) : (
              <p className="text-gray-600">
                Browse the available bathrooms below or{' '}
                <Link href="/auth" className="text-indigo-600 hover:text-indigo-800">
                  sign in
                </Link>
                {' '}to add your own entries and post reviews.
              </p>
            )}
          </div>

          {/* API Testing Links */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Testing Links</h2>
            <ul className="space-y-2 text-blue-600">
              <li>
                <Link href="/api/bathrooms" target="_blank">
                  GET /api/bathrooms - List all approved bathrooms
                </Link>
              </li>
              <li>
                <Link href="/api/supabase-test" target="_blank">
                  GET /api/supabase-test - Test Supabase connection
                </Link>
              </li>
            </ul>
          </div>

          {/* Add bathroom form - only show if logged in */}
          {user && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Bathroom</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    id="building"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor (optional)
                  </label>
                  <input
                    type="text"
                    id="floor"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="directions" className="block text-sm font-medium text-gray-700 mb-1">
                    Directions (optional)
                  </label>
                  <textarea
                    id="directions"
                    value={directions}
                    onChange={(e) => setDirections(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    rows={3}
                  />
                </div>

                {addError && (
                  <p className="text-red-600 mb-4">{addError}</p>
                )}
                <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Bathroom'}
                </button>
              </form>
            </div>
          )}

          {!user && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col items-center justify-center py-6">
                <p className="mb-4 text-gray-600 text-center">
                  Want to contribute? Sign in to add new bathrooms!
                </p>
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in to contribute
                </Link>
              </div>
            </div>
          )}

          {loading && (
            <p className="text-center text-gray-600">Loading bathrooms...</p>
          )}

          {error && (
            <p className="text-center text-red-600 mb-4">Error: {error}</p>
          )}

          {!loading && !error && bathrooms.length === 0 && (
            <p className="text-center text-gray-600">No bathrooms found.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bathrooms.map((bathroom) => (
              <div
                key={bathroom.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {bathroom.name}
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>Building:</strong> {bathroom.building}
                </p>
                <p className="text-gray-600">
                  <strong>Address:</strong> {bathroom.address}
                </p>
                {bathroom.floor && (
                  <p className="text-gray-600">
                    <strong>Floor:</strong> {bathroom.floor}
                  </p>
                )}
                {bathroom.directions && (
                  <p className="text-gray-600">
                    <strong>Directions:</strong> {bathroom.directions}
                  </p>
                )}
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Status: {bathroom.status}
                  </div>
                  <Link 
                    href={`/api/bathrooms/${bathroom.id}`}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
