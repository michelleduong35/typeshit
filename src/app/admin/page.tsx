'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [bathrooms, setBathrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }
    
    if (!isAdmin) {
      router.push('/')
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch profiles (users)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
        
        if (profilesError) throw profilesError
        setUsers(profilesData || [])

        // Fetch bathrooms
        const { data: bathroomsData, error: bathroomsError } = await supabase
          .from('bathrooms')
          .select('*')
        
        if (bathroomsError) throw bathroomsError
        setBathrooms(bathroomsData || [])

      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, isAdmin, router])

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId)
      
      if (error) throw error
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ))
    } catch (error) {
      console.error('Error updating admin status:', error)
    }
  }

  const deleteBathroom = async (bathroomId: string) => {
    try {
      const { error } = await supabase
        .from('bathrooms')
        .delete()
        .eq('id', bathroomId)
      
      if (error) throw error
      
      // Update local state
      setBathrooms(bathrooms.filter(bathroom => bathroom.id !== bathroomId))
    } catch (error) {
      console.error('Error deleting bathroom:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and permissions</p>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name || 'No name'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Bathroom Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage bathroom listings</p>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bathrooms.map((bathroom) => (
                <tr key={bathroom.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bathroom.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bathroom.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bathroom.building}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bathroom.floor || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => deleteBathroom(bathroom.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 