/**
 * Payment Gateway Integration Module
 * Supports multiple payment providers
 */

export type PaymentGateway = 
  | 'stripe'
  | 'paystack'
  | 'flutterwave'
  | 'alipay'
  | 'momo'
  | 'manual';

export interface PaymentGatewayConfig {
  id: PaymentGateway;
  name: string;
  description: string;
  logo: string;
  isEnabled: boolean;
  publicKey?: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  minAmount: number;
  maxAmount: number;
  fees: {
    percentage: number;
    fixed: number;
    currency: string;
  };
}

export interface PaymentIntent {
  id: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, any>;
  createdAt: Date;
}

// Default gateway configurations
export const DEFAULT_GATEWAYS: Record<PaymentGateway, Omit<PaymentGatewayConfig, 'isEnabled' | 'publicKey'>> = {
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Credit/Debit cards, Apple Pay, Google Pay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    supportedCountries: ['US', 'CA', 'GB', 'EU', 'AU', 'JP'],
    minAmount: 50, // cents
    maxAmount: 99999999,
    fees: { percentage: 2.9, fixed: 30, currency: 'USD' },
  },
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    description: 'Cards, Bank transfers, USSD, Mobile money',
    logo: 'https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png',
    supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'KES', 'USD'],
    supportedCountries: ['NG', 'GH', 'ZA', 'KE'],
    minAmount: 100, // kobo/pesewas
    maxAmount: 50000000,
    fees: { percentage: 1.5, fixed: 100, currency: 'NGN' },
  },
  flutterwave: {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Cards, Mobile money, Bank transfers',
    logo: 'https://flutterwave.com/images/logo/full.svg',
    supportedCurrencies: ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'GBP', 'EUR', 'UGX', 'TZS', 'XAF', 'XOF'],
    supportedCountries: ['NG', 'GH', 'KE', 'ZA', 'UG', 'TZ', 'CM', 'CI'],
    minAmount: 100,
    maxAmount: 100000000,
    fees: { percentage: 1.4, fixed: 0, currency: 'NGN' },
  },
  alipay: {
    id: 'alipay',
    name: 'Alipay',
    description: 'Chinese digital wallet payments',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Alipay_logo_%282020%29.svg',
    supportedCurrencies: ['CNY', 'USD', 'EUR', 'GBP', 'HKD', 'JPY'],
    supportedCountries: ['CN', 'HK', 'MO'],
    minAmount: 1,
    maxAmount: 500000000,
    fees: { percentage: 2.2, fixed: 0, currency: 'CNY' },
  },
  momo: {
    id: 'momo',
    name: 'MTN MoMo',
    description: 'MTN Mobile Money payments',
    logo: 'https://momo.mtn.com/wp-content/uploads/2020/07/momo-logo.png',
    supportedCurrencies: ['GHS', 'UGX', 'RWF', 'ZMW', 'XAF', 'XOF'],
    supportedCountries: ['GH', 'UG', 'RW', 'ZM', 'CM', 'CI', 'BJ', 'TG'],
    minAmount: 50,
    maxAmount: 5000000,
    fees: { percentage: 1.0, fixed: 0, currency: 'GHS' },
  },
  manual: {
    id: 'manual',
    name: 'Manual Payment',
    description: 'Bank transfer, Cash, Other methods',
    logo: '',
    supportedCurrencies: ['*'],
    supportedCountries: ['*'],
    minAmount: 0,
    maxAmount: 999999999,
    fees: { percentage: 0, fixed: 0, currency: 'USD' },
  },
};

// Gateway integration helpers
export class PaymentGatewayService {
  private gateway: PaymentGateway;
  private config: PaymentGatewayConfig;

  constructor(gateway: PaymentGateway, config: PaymentGatewayConfig) {
    this.gateway = gateway;
    this.config = config;
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>): Promise<PaymentIntent> {
    const intent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gateway: this.gateway,
      amount,
      currency,
      status: 'pending',
      metadata,
      createdAt: new Date(),
    };

    // Gateway-specific logic would go here
    switch (this.gateway) {
      case 'stripe':
        // Stripe API call
        break;
      case 'paystack':
        // Paystack API call
        break;
      case 'flutterwave':
        // Flutterwave API call
        break;
      case 'alipay':
        // Alipay API call
        break;
      case 'momo':
        // MoMo API call
        break;
      case 'manual':
        // Manual verification
        break;
    }

    return intent;
  }

  calculateFees(amount: number): number {
    return Math.round((amount * this.config.fees.percentage / 100) + this.config.fees.fixed);
  }

  isAmountValid(amount: number): boolean {
    return amount >= this.config.minAmount && amount <= this.config.maxAmount;
  }
}

// Payment webhook verification
export function verifyWebhookSignature(
  gateway: PaymentGateway,
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implement gateway-specific signature verification
  switch (gateway) {
    case 'stripe':
      // Stripe signature verification
      return true;
    case 'paystack':
      // Paystack signature verification
      return true;
    case 'flutterwave':
      // Flutterwave signature verification
      return true;
    default:
      return false;
  }
}
