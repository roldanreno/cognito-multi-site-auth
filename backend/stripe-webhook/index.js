/**
 * Stripe Webhook Lambda
 * Adds/removes users from paid_users group based on subscription status
 */
const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognito = new CognitoIdentityProviderClient();
const USER_POOL_ID = process.env.USER_POOL_ID;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async (event) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Verify webhook signature
    const sig = event.headers['stripe-signature'];
    let stripeEvent;
    
    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    const userId = stripeEvent.data.object.client_reference_id;
    if (!userId) return { statusCode: 400, body: 'No user ID' };

    try {
        if (stripeEvent.type === 'checkout.session.completed' || stripeEvent.type === 'customer.subscription.created') {
            await cognito.send(new AdminAddUserToGroupCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
                GroupName: 'paid_users'
            }));
        }
        
        if (stripeEvent.type === 'customer.subscription.deleted') {
            await cognito.send(new AdminRemoveUserFromGroupCommand({
                UserPoolId: USER_POOL_ID,
                Username: userId,
                GroupName: 'paid_users'
            }));
        }
        
        return { statusCode: 200, body: 'OK' };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: err.message };
    }
};
