const paypal = require('@paypal/checkout-server-sdk');

// Set up the environment for PayPal (Sandbox or Live)
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

// Set up the PayPal client with the environment
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
