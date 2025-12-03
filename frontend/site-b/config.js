// Site B Configuration (Paid Site)
const CONFIG = {
    cognitoDomain: 'YOUR_DOMAIN.auth.us-east-1.amazoncognito.com',
    clientId: 'YOUR_CLIENT_B_ID',
    redirectUri: 'https://your-site-b.s3.amazonaws.com/callback.html',
    logoutUri: 'https://your-site-b.s3.amazonaws.com/index.html',
    stripeCheckoutUrl: 'https://checkout.stripe.com/pay/YOUR_SESSION'
};
initAuth(CONFIG);
