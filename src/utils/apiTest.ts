/**
 * Test utility for API endpoints
 * 
 * This file provides helper functions to test the API endpoints
 * from the browser console or a client-side component
 */

import { supabase } from './supabaseClient';

// Helper to get the current auth token
const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
};

// Example usage:
// import { fetchBathrooms, createBathroom, ... } from '@/utils/apiTest';
// const bathrooms = await fetchBathrooms();
// console.log(bathrooms);

/**
 * Fetch all approved bathrooms
 */
export async function fetchBathrooms() {
  const response = await fetch('/api/bathrooms');
  return response.json();
}

/**
 * Create a new bathroom (requires authentication)
 */
export async function createBathroom(bathroom: {
  name: string;
  building: string;
  address: string;
  floor?: string;
  directions?: string;
}) {
  const token = await getAuthToken();

  const response = await fetch('/api/bathrooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(bathroom)
  });
  return response.json();
}

/**
 * Fetch a bathroom by ID with images and average rating
 */
export async function fetchBathroomById(id: string) {
  const response = await fetch(`/api/bathrooms/${id}`);
  return response.json();
}

/**
 * Approve a bathroom (admin only)
 */
export async function approveBathroom(id: string) {
  const token = await getAuthToken();

  const response = await fetch(`/api/bathrooms/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

/**
 * Fetch reviews for a bathroom
 */
export async function fetchBathroomReviews(id: string) {
  const response = await fetch(`/api/bathrooms/${id}/reviews`);
  return response.json();
}

/**
 * Create a review for a bathroom (requires authentication)
 */
export async function createBathroomReview(id: string, review: {
  rating: number;
  comment?: string;
}) {
  const token = await getAuthToken();

  const response = await fetch(`/api/bathrooms/${id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(review)
  });
  return response.json();
}

/**
 * Fetch images for a bathroom
 */
export async function fetchBathroomImages(id: string) {
  const response = await fetch(`/api/bathrooms/${id}/images`);
  return response.json();
}

/**
 * Create an image for a bathroom (requires authentication)
 */
export async function createBathroomImage(id: string, image: {
  url: string;
  caption?: string;
}) {
  const token = await getAuthToken();

  const response = await fetch(`/api/bathrooms/${id}/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(image)
  });
  return response.json();
} 