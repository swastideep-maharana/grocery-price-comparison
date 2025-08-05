import { PlatformConfig } from "@/types";

export const platformConfigs: Record<string, PlatformConfig> = {
  blinkit: {
    name: "blinkit",
    baseUrl: "https://blinkit.com",
    selectors: {
      loginButton:
        '[data-testid="login-button"], .login-btn, button[aria-label*="login"]',
      phoneInput:
        'input[type="tel"], input[name="phone"], input[placeholder*="phone"]',
      submitButton:
        'button[type="submit"], .submit-btn, button:contains("Send OTP")',
      otpInput:
        'input[type="text"], input[name="otp"], input[placeholder*="OTP"]',
      otpSubmitButton:
        'button[type="submit"], .verify-btn, button:contains("Verify")',
      addToCartButton:
        'button[aria-label*="add to cart"], .add-to-cart, button:contains("Add")',
      cartButton: '[data-testid="cart"], .cart-icon, a[href*="cart"]',
      priceSelector: '.price, [data-testid="price"], .product-price',
      variantSelector:
        '.variant-option, [data-testid="variant"], .weight-option',
    },
  },
  zepto: {
    name: "zepto",
    baseUrl: "https://zepto.in",
    selectors: {
      loginButton:
        '[data-testid="login"], .login-button, button:contains("Login")',
      phoneInput:
        'input[type="tel"], input[name="mobile"], input[placeholder*="mobile"]',
      submitButton:
        'button[type="submit"], .send-otp, button:contains("Send OTP")',
      otpInput:
        'input[type="text"], input[name="otp"], input[placeholder*="OTP"]',
      otpSubmitButton:
        'button[type="submit"], .verify-otp, button:contains("Verify")',
      addToCartButton:
        'button[aria-label*="add"], .add-btn, button:contains("Add")',
      cartButton: '[data-testid="cart"], .cart, a[href*="cart"]',
      priceSelector: '.price, [data-testid="price"], .product-price',
      variantSelector: '.variant, [data-testid="variant"], .size-option',
    },
  },
  instamart: {
    name: "instamart",
    baseUrl: "https://www.instamart.in",
    selectors: {
      loginButton:
        '[data-testid="login"], .login-btn, button:contains("Login")',
      phoneInput:
        'input[type="tel"], input[name="phone"], input[placeholder*="phone"]',
      submitButton:
        'button[type="submit"], .send-otp, button:contains("Send OTP")',
      otpInput:
        'input[type="text"], input[name="otp"], input[placeholder*="OTP"]',
      otpSubmitButton:
        'button[type="submit"], .verify-otp, button:contains("Verify")',
      addToCartButton:
        'button[aria-label*="add"], .add-to-cart, button:contains("Add")',
      cartButton: '[data-testid="cart"], .cart-icon, a[href*="cart"]',
      priceSelector: '.price, [data-testid="price"], .product-price',
      variantSelector: '.variant, [data-testid="variant"], .weight-option',
    },
  },
};

export const getPlatformConfig = (platform: string): PlatformConfig => {
  const config = platformConfigs[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return config;
};
