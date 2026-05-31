export const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

export const isAuthenticated = () => {
    const decoded = getDecodedToken();
    if (!decoded) return false;
    
    // Check expiration if 'exp' is present
    if (decoded.exp) {
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
            localStorage.removeItem('token');
            return false;
        }
    }
    return true;
};

export const isAdmin = () => {
    const decoded = getDecodedToken();
    return decoded && decoded.role === 'admin';
};
