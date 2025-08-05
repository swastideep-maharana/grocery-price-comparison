export interface SessionData {
  id: string;
  phoneNumber: string;
  cookies: any[];
  domSnapshot?: string;
  currentUrl: string;
  platform: "blinkit" | "zepto" | "instamart";
  createdAt: Date;
  updatedAt: Date;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  phoneNumber: string;
  platform: "blinkit" | "zepto" | "instamart";
}

export interface LoginResponse {
  status: "OTP_SENT" | "ERROR";
  message: string;
  sessionId?: string;
}

export interface OTPRequest {
  otp: string;
  sessionId: string;
}

export interface OTPResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  sessionData?: SessionData;
}

export interface ProductVariant {
  productId: string;
  weight: string;
  variantId?: string;
}

export interface AddProductsRequest {
  sessionId: string;
  productUrls: string[];
  variants: Record<string, string>; // productId -> weight/variant
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image?: string;
}

export interface CartDetails {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export interface AddProductsResponse {
  cartDetails: CartDetails;
  finalPrice: number;
  status: "SUCCESS" | "ERROR";
  message?: string;
}

export interface PlatformConfig {
  name: "blinkit" | "zepto" | "instamart";
  baseUrl: string;
  selectors: {
    loginButton: string;
    phoneInput: string;
    submitButton: string;
    otpInput: string;
    otpSubmitButton: string;
    addToCartButton: string;
    cartButton: string;
    priceSelector: string;
    variantSelector: string;
  };
}

export interface BrowserSession {
  page: any; // Puppeteer page object
  context: any; // Puppeteer context object
  isActive: boolean;
}

export interface ErrorResponse {
  status: "ERROR";
  message: string;
  code?: string;
}
