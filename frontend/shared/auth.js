/**
 * Cognito Authentication Module
 */

let COGNITO_DOMAIN = '';
let CLIENT_ID = '';
let REDIRECT_URI = '';
let LOGOUT_URI = '';

function initAuth(config) {
    COGNITO_DOMAIN = config.cognitoDomain;
    CLIENT_ID = config.clientId;
    REDIRECT_URI = config.redirectUri;
    LOGOUT_URI = config.logoutUri || window.location.origin;
}

function saveTokens(idToken, accessToken, refreshToken, expiresIn = 3600) {
    localStorage.setItem('id_token', idToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('token_expiry', Date.now() + (expiresIn * 1000));
}

function clearTokens() {
    ['id_token', 'access_token', 'refresh_token', 'token_expiry'].forEach(k => localStorage.removeItem(k));
}

function isAuthenticated() {
    return !!localStorage.getItem('refresh_token');
}

function isTokenExpired() {
    const expiry = localStorage.getItem('token_expiry');
    return !expiry || Date.now() > parseInt(expiry);
}

async function refreshTokens() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: CLIENT_ID,
                refresh_token: refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            saveTokens(data.id_token, data.access_token, data.refresh_token || refreshToken, data.expires_in);
            return true;
        }
        clearTokens();
        return false;
    } catch (e) {
        return false;
    }
}

async function requireAuth() {
    if (!isAuthenticated()) { redirectToLogin(); return false; }
    if (isTokenExpired() && !await refreshTokens()) { redirectToLogin(); return false; }
    return true;
}

function redirectToLogin() {
    window.location.href = `https://${COGNITO_DOMAIN}/login?` + new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        scope: 'openid email profile',
        redirect_uri: REDIRECT_URI
    });
}

function logout() {
    clearTokens();
    window.location.href = `https://${COGNITO_DOMAIN}/logout?` + new URLSearchParams({
        client_id: CLIENT_ID,
        logout_uri: LOGOUT_URI
    });
}

function getUser() {
    const idToken = localStorage.getItem('id_token');
    if (!idToken) return null;
    try {
        return JSON.parse(atob(idToken.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function getUserGroups() {
    const user = getUser();
    return user ? (user['cognito:groups'] || []) : [];
}

function isPaidUser() {
    return getUserGroups().includes('paid_users');
}

function getAccessToken() {
    return localStorage.getItem('access_token');
}

async function handleCallback() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (!code) return { success: false, error: 'No code' };

    try {
        const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        if (!response.ok) return { success: false, error: 'Token exchange failed' };
        
        const data = await response.json();
        saveTokens(data.id_token, data.access_token, data.refresh_token, data.expires_in);
        return { success: true };
    } catch (e) {
        return { success: false, error: e.message };
    }
}
