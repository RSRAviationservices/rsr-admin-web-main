import axios from 'axios'
import Cookies from 'js-cookie'

import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

apiClient.interceptors.request.use((config) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
    const csrfToken = Cookies.get('csrf_token')
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().actions.logout(false)
    }

    const errorPayload = error.response?.data?.error
    const finalMessage = errorPayload?.message || error.message || 'An unexpected error occurred.'
    return Promise.reject(new Error(finalMessage))
  }
)

export default apiClient
