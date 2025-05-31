
// API base URL
const API_BASE_URL ='https://medicare-code-swap-forge-20.onrender.com/api';

// Generic API request function
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    } as HeadersInit;
    
    // Add token if available - check both possible token keys
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-auth-token'] = token; // Add token as x-auth-token as well for compatibility
    }
    
    console.log('Making API request to:', url);
    console.log('With headers:', headers);
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Return json response
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${error}`);
    throw error;
  }
};
