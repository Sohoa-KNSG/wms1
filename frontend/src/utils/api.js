// Utility helper for authenticated fetch requests with JWT token header

export async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('wms_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Auto-normalize legacy port 3001 or missing /v1/ prefix
    let targetUrl = url;
    if (typeof targetUrl === 'string') {
        targetUrl = targetUrl.replace(/http:\/\/[^/]+:3001\/api\//g, '/api/v1/');
        if (targetUrl.startsWith('/api/') && !targetUrl.startsWith('/api/v1/')) {
            targetUrl = targetUrl.replace('/api/', '/api/v1/');
        }
    }

    const response = await fetch(targetUrl, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('wms_token');
        localStorage.removeItem('wms_user');
        if (window.location.pathname !== '/login') {
            window.location.reload();
        }
    }

    return response;
}
