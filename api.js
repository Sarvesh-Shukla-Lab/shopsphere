/* ==========================================================================
   SHOPSPHERE - CENTRAL REST API SERVICE & HTTP CLIENT
   ========================================================================== */

const API_BASE_URL = window.API_BASE_URL || "http://localhost:8080/api";

async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const token = localStorage.getItem('shopsphere_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok || (data && data.success === false)) {
            const errorMsg = (data && (data.message || data.error)) || `HTTP Error ${response.status}`;
            const err = new Error(errorMsg);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    } catch (err) {
        console.error(`[API Fetch Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
        throw err;
    }
}
