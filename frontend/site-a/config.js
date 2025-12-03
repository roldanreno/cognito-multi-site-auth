// Site A Configuration (Free Site)
const CONFIG = {
    cognitoDomain: 'YOUR_DOMAIN.auth.us-east-1.amazoncognito.com',
    clientId: 'YOUR_CLIENT_A_ID',
    redirectUri: 'https://your-site-a.s3.amazonaws.com/callback.html',
    logoutUri: 'https://your-site-a.s3.amazonaws.com/index.html'
};
initAuth(CONFIG);
