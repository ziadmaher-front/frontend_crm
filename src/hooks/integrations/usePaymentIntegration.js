import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../useAuth';

// Payment providers configuration
const PAYMENT_PROVIDERS = {
  STRIPE: {
    name: 'Stripe',
    icon: '💳',
    color: '#635BFF',
    supportedMethods: ['card', 'bank_transfer', 'apple_pay', 'google_pay'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    apiUrl: 'https://api.stripe.com/v1',
    publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
    secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY
  },
  PAYPAL: {
    name: 'PayPal',
    icon: '🅿️',
    color: '#0070BA',
    supportedMethods: ['paypal', 'card', 'bank_transfer'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    apiUrl: 'https://api.paypal.com/v2',
    sandboxUrl: 'https://api.sandbox.paypal.com/v2',
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    clientSecret: process.env.REACT_APP_PAYPAL_CLIENT_SECRET
  },
  SQUARE: {
    name: 'Square',
    icon: '⬜',
    color: '#3E4348',
    supportedMethods: ['card', 'apple_pay', 'google_pay'],
    currencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY'],
    apiUrl: 'https://connect.squareup.com/v2',
    sandboxUrl: 'https://connect.squareupsandbox.com/v2',
    applicationId: process.env.REACT_APP_SQUARE_APPLICATION_ID,
    accessToken: process.env.REACT_APP_SQUARE_ACCESS_TOKEN
  },
  RAZORPAY: {
    name: 'Razorpay',
    icon: '💰',
    color: '#3395FF',
    supportedMethods: ['card', 'netbanking', 'wallet', 'upi'],
    currencies: ['INR'],
    apiUrl: 'https://api.razorpay.com/v1',
    keyId: process.env.REACT_APP_RAZORPAY_KEY_ID,
    keySecret: process.env.REACT_APP_RAZORPAY_KEY_SECRET
  }
};

// Payment statuses
const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

// Transaction types
const TRANSACTION_TYPES = {
  PAYMENT: 'payment',
  REFUND: 'refund',
  CHARGEBACK: 'chargeback',
  DISPUTE: 'dispute',
  TRANSFER: 'transfer'
};

class PaymentIntegrationEngine {
  constructor(provider, config, notifications) {
    this.provider = provider;
    this.config = config;
    this.notifications = notifications;
    this.isTestMode = config.testMode || false;
  }

  // Payment processing methods
  async createPaymentIntent(paymentData) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.createStripePaymentIntent(paymentData);
        case 'PAYPAL':
          return await this.createPayPalOrder(paymentData);
        case 'SQUARE':
          return await this.createSquarePayment(paymentData);
        case 'RAZORPAY':
          return await this.createRazorpayOrder(paymentData);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      this.notifications.error('Failed to create payment');
      throw error;
    }
  }

  async createStripePaymentIntent(paymentData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        payment_method_types: JSON.stringify(paymentData.paymentMethods || ['card']),
        description: paymentData.description || '',
        metadata: JSON.stringify({
          orderId: paymentData.orderId,
          customerId: paymentData.customerId,
          ...paymentData.metadata
        })
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe error: ${error.error?.message || response.status}`);
    }

    const paymentIntent = await response.json();
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      provider: 'STRIPE'
    };
  }

  async createPayPalOrder(paymentData) {
    const apiUrl = this.isTestMode ? PAYMENT_PROVIDERS.PAYPAL.sandboxUrl : PAYMENT_PROVIDERS.PAYPAL.apiUrl;
    
    // First get access token
    const tokenResponse = await fetch(`${apiUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYMENT_PROVIDERS.PAYPAL.clientId}:${PAYMENT_PROVIDERS.PAYPAL.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`PayPal token error: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create order
    const orderResponse = await fetch(`${apiUrl}/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: paymentData.currency,
            value: paymentData.amount.toFixed(2)
          },
          description: paymentData.description || '',
          custom_id: paymentData.orderId
        }],
        application_context: {
          return_url: paymentData.returnUrl,
          cancel_url: paymentData.cancelUrl
        }
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.json();
      throw new Error(`PayPal error: ${error.message || orderResponse.status}`);
    }

    const order = await orderResponse.json();
    return {
      id: order.id,
      status: order.status,
      amount: paymentData.amount,
      currency: paymentData.currency,
      approvalUrl: order.links.find(link => link.rel === 'approve')?.href,
      provider: 'PAYPAL'
    };
  }

  async createSquarePayment(paymentData) {
    const apiUrl = this.isTestMode ? PAYMENT_PROVIDERS.SQUARE.sandboxUrl : PAYMENT_PROVIDERS.SQUARE.apiUrl;
    
    const response = await fetch(`${apiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.SQUARE.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2023-10-18'
      },
      body: JSON.stringify({
        source_id: paymentData.sourceId, // Card nonce or payment method
        amount_money: {
          amount: Math.round(paymentData.amount * 100), // Convert to cents
          currency: paymentData.currency
        },
        idempotency_key: paymentData.idempotencyKey || this.generateIdempotencyKey(),
        note: paymentData.description || '',
        order_id: paymentData.orderId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Square error: ${error.errors?.[0]?.detail || response.status}`);
    }

    const payment = await response.json();
    return {
      id: payment.payment.id,
      status: payment.payment.status,
      amount: payment.payment.amount_money.amount / 100,
      currency: payment.payment.amount_money.currency,
      provider: 'SQUARE'
    };
  }

  async createRazorpayOrder(paymentData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.RAZORPAY.apiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYMENT_PROVIDERS.RAZORPAY.keyId}:${PAYMENT_PROVIDERS.RAZORPAY.keySecret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(paymentData.amount * 100), // Convert to paise
        currency: paymentData.currency,
        receipt: paymentData.orderId,
        notes: paymentData.metadata || {}
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Razorpay error: ${error.error?.description || response.status}`);
    }

    const order = await response.json();
    return {
      id: order.id,
      status: order.status,
      amount: order.amount / 100,
      currency: order.currency,
      provider: 'RAZORPAY'
    };
  }

  // Payment confirmation and capture
  async confirmPayment(paymentId, confirmationData) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.confirmStripePayment(paymentId, confirmationData);
        case 'PAYPAL':
          return await this.capturePayPalOrder(paymentId);
        case 'SQUARE':
          return await this.getSquarePayment(paymentId);
        case 'RAZORPAY':
          return await this.captureRazorpayPayment(paymentId, confirmationData);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      this.notifications.error('Failed to confirm payment');
      throw error;
    }
  }

  async confirmStripePayment(paymentIntentId, confirmationData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/payment_intents/${paymentIntentId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        payment_method: confirmationData.paymentMethodId,
        return_url: confirmationData.returnUrl || window.location.origin
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe error: ${error.error?.message || response.status}`);
    }

    return await response.json();
  }

  async capturePayPalOrder(orderId) {
    const apiUrl = this.isTestMode ? PAYMENT_PROVIDERS.PAYPAL.sandboxUrl : PAYMENT_PROVIDERS.PAYPAL.apiUrl;
    
    // Get access token
    const tokenResponse = await fetch(`${apiUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYMENT_PROVIDERS.PAYPAL.clientId}:${PAYMENT_PROVIDERS.PAYPAL.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capture order
    const response = await fetch(`${apiUrl}/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`PayPal error: ${error.message || response.status}`);
    }

    return await response.json();
  }

  // Refund processing
  async createRefund(paymentId, refundData) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.createStripeRefund(paymentId, refundData);
        case 'PAYPAL':
          return await this.createPayPalRefund(paymentId, refundData);
        case 'SQUARE':
          return await this.createSquareRefund(paymentId, refundData);
        case 'RAZORPAY':
          return await this.createRazorpayRefund(paymentId, refundData);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to create refund:', error);
      this.notifications.error('Failed to process refund');
      throw error;
    }
  }

  async createStripeRefund(paymentIntentId, refundData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        payment_intent: paymentIntentId,
        amount: refundData.amount ? Math.round(refundData.amount * 100) : undefined,
        reason: refundData.reason || 'requested_by_customer',
        metadata: JSON.stringify(refundData.metadata || {})
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe refund error: ${error.error?.message || response.status}`);
    }

    return await response.json();
  }

  // Customer management
  async createCustomer(customerData) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.createStripeCustomer(customerData);
        case 'PAYPAL':
          return await this.createPayPalCustomer(customerData);
        case 'SQUARE':
          return await this.createSquareCustomer(customerData);
        default:
          throw new Error(`Customer creation not supported for ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  async createStripeCustomer(customerData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone || '',
        description: customerData.description || '',
        metadata: JSON.stringify(customerData.metadata || {})
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe customer error: ${error.error?.message || response.status}`);
    }

    return await response.json();
  }

  // Payment method management
  async savePaymentMethod(customerId, paymentMethodData) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.attachStripePaymentMethod(customerId, paymentMethodData);
        default:
          throw new Error(`Payment method saving not supported for ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to save payment method:', error);
      throw error;
    }
  }

  async attachStripePaymentMethod(customerId, paymentMethodData) {
    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/payment_methods/${paymentMethodData.paymentMethodId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        customer: customerId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe payment method error: ${error.error?.message || response.status}`);
    }

    return await response.json();
  }

  // Analytics and reporting
  async getTransactions(filters = {}) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.getStripeTransactions(filters);
        case 'PAYPAL':
          return await this.getPayPalTransactions(filters);
        case 'SQUARE':
          return await this.getSquareTransactions(filters);
        default:
          throw new Error(`Transaction reporting not supported for ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  }

  async getStripeTransactions(filters) {
    const params = new URLSearchParams({
      limit: filters.limit || 100,
      created: JSON.stringify({
        gte: filters.startDate ? Math.floor(new Date(filters.startDate).getTime() / 1000) : undefined,
        lte: filters.endDate ? Math.floor(new Date(filters.endDate).getTime() / 1000) : undefined
      })
    });

    const response = await fetch(`${PAYMENT_PROVIDERS.STRIPE.apiUrl}/charges?${params}`, {
      headers: {
        'Authorization': `Bearer ${PAYMENT_PROVIDERS.STRIPE.secretKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Stripe transactions error: ${response.status}`);
    }

    return await response.json();
  }

  // Webhook handling
  async verifyWebhook(payload, signature, secret) {
    try {
      switch (this.provider) {
        case 'STRIPE':
          return await this.verifyStripeWebhook(payload, signature, secret);
        case 'PAYPAL':
          return await this.verifyPayPalWebhook(payload, signature, secret);
        default:
          throw new Error(`Webhook verification not supported for ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to verify webhook:', error);
      throw error;
    }
  }

  async verifyStripeWebhook(payload, signature, secret) {
    // This would typically be done on the server side
    const crypto = require('crypto');
    const elements = signature.split(',');
    const signatureHash = elements.find(element => element.startsWith('v1=')).split('v1=')[1];
    const timestamp = elements.find(element => element.startsWith('t=')).split('t=')[1];
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(timestamp + '.' + payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Utility methods
  generateIdempotencyKey() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatAmount(amount, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  validatePaymentData(paymentData) {
    const required = ['amount', 'currency'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (paymentData.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!PAYMENT_PROVIDERS[this.provider].currencies.includes(paymentData.currency)) {
      throw new Error(`Currency ${paymentData.currency} not supported by ${this.provider}`);
    }

    return true;
  }
}

// Main hook
export const usePaymentIntegration = (options = {}) => {
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [paymentEngine, setPaymentEngine] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { user } = useAuth();

  // Load connected providers
  const { data: providers, isLoading: providersLoading } = useQuery(
    ['payment-providers', user?.id],
    async () => {
      const response = await fetch('/api/payment/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
    { enabled: !!user }
  );

  useEffect(() => {
    if (providers) {
      setConnectedProviders(providers);
      if (providers.length > 0 && !activeProvider) {
        setActiveProvider(providers[0]);
      }
    }
  }, [providers, activeProvider]);

  // Initialize payment engine
  useEffect(() => {
    if (activeProvider) {
      const engine = new PaymentIntegrationEngine(
        activeProvider.type,
        activeProvider.config,
        notifications
      );
      setPaymentEngine(engine);
    }
  }, [activeProvider, notifications]);

  // Create payment intent mutation
  const createPaymentMutation = useMutation(
    async (paymentData) => {
      if (!paymentEngine) {
        throw new Error('No payment provider configured');
      }
      setIsProcessing(true);
      return await paymentEngine.createPaymentIntent(paymentData);
    },
    {
      onSuccess: () => {
        notifications.success('Payment initiated successfully');
      },
      onError: (error) => {
        console.error('Failed to create payment:', error);
        notifications.error('Failed to initiate payment');
      },
      onSettled: () => {
        setIsProcessing(false);
      }
    }
  );

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation(
    async ({ paymentId, confirmationData }) => {
      if (!paymentEngine) {
        throw new Error('No payment provider configured');
      }
      return await paymentEngine.confirmPayment(paymentId, confirmationData);
    },
    {
      onSuccess: () => {
        notifications.success('Payment confirmed successfully');
        queryClient.invalidateQueries(['transactions']);
      },
      onError: (error) => {
        console.error('Failed to confirm payment:', error);
        notifications.error('Failed to confirm payment');
      }
    }
  );

  // Create refund mutation
  const createRefundMutation = useMutation(
    async ({ paymentId, refundData }) => {
      if (!paymentEngine) {
        throw new Error('No payment provider configured');
      }
      return await paymentEngine.createRefund(paymentId, refundData);
    },
    {
      onSuccess: () => {
        notifications.success('Refund processed successfully');
        queryClient.invalidateQueries(['transactions']);
      },
      onError: (error) => {
        console.error('Failed to process refund:', error);
        notifications.error('Failed to process refund');
      }
    }
  );

  // Get transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery(
    ['transactions', activeProvider?.id],
    async () => {
      if (!paymentEngine) return [];
      return await paymentEngine.getTransactions();
    },
    { enabled: !!paymentEngine }
  );

  return {
    // State
    connectedProviders,
    activeProvider,
    isProcessing,
    providersLoading,
    transactionsLoading,
    
    // Data
    transactions,
    availableProviders: PAYMENT_PROVIDERS,
    paymentStatus: PAYMENT_STATUS,
    transactionTypes: TRANSACTION_TYPES,
    
    // Actions
    setActiveProvider,
    createPayment: createPaymentMutation.mutate,
    confirmPayment: confirmPaymentMutation.mutate,
    createRefund: createRefundMutation.mutate,
    
    // Loading states
    isCreatingPayment: createPaymentMutation.isLoading,
    isConfirmingPayment: confirmPaymentMutation.isLoading,
    isCreatingRefund: createRefundMutation.isLoading,
    
    // Utilities
    paymentEngine
  };
};

export default usePaymentIntegration;