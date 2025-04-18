'use client'

import { useEffect, useState, FormEvent } from 'react'
import { supabase } from '@/utils/supabaseClient'
import type { Database } from '@/utils/supabaseClient'

type Bathroom = Database['public']['Tables']['bathrooms']['Row']

export default function Home() {
  const [bathrooms, setBathrooms] = useState<Bathroom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const fetchBathrooms = async () => {
    try {
      console.log('Fetching bathrooms from Supabase...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase
        .from('bathrooms')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Bathrooms data:', data);
      setBathrooms(data || []);
    } catch (err) {
      console.error('Error fetching bathrooms:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBathrooms();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    
    try {
      const { error } = await supabase
        .from('bathrooms')
        .insert([{ name, rating }]);
        
      if (error) throw error;
      
      // Clear form and refresh data
      setName('');
      setRating(5);
      fetchBathrooms();
    } catch (err) {
      console.error('Error adding bathroom:', err);
      setAddError(err instanceof Error ? err.message : 'Failed to add bathroom');
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Bathroom Ratings
        </h1>

        {/* Add bathroom form */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                Rating (1-5)
              </label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
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

        {/* API test link */}
        <div className="text-center mb-8">
          <a 
            href="/api/supabase-test" 
            target="_blank" 
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Test Supabase Connection
          </a>
        </div>

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
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-gray-600">{bathroom.rating}/5</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
