import { v4 as uuidv4 } from "uuid";
import {
  SessionData,
  LoginRequest,
  OTPRequest,
  AddProductsRequest,
  CartDetails,
  CartItem,
} from "@/types";
import { getPlatformConfig } from "@/config/platforms";
import browserManager from "./browser";
import dbManager from "./database";

const MOCK_MODE =
  process.env.NODE_ENV === "development" &&
  process.env.USE_MOCK_DATA === "true";

const mockCartItems: CartItem[] = [
  {
    productId: "mock-product-1",
    name: "Organic Bananas",
    price: 45,
    quantity: 1,
    weight: "1kg",
    image: "https://via.placeholder.com/100x100?text=Banana",
  },
  {
    productId: "mock-product-2",
    name: "Fresh Milk",
    price: 65,
    quantity: 1,
    weight: "1L",
    image: "https://via.placeholder.com/100x100?text=Milk",
  },
  {
    productId: "mock-product-3",
    name: "Whole Wheat Bread",
    price: 35,
    quantity: 1,
    weight: "400g",
    image: "https://via.placeholder.com/100x100?text=Bread",
  },
];

const mockCartDetails: CartDetails = {
  items: mockCartItems,
  subtotal: 145,
  deliveryFee: 20,
  taxes: 8.7,
  total: 173.7,
  currency: "INR",
};

class AutomationService {
  async initiateLogin(
    phoneNumber: string,
    platform: string
  ): Promise<{ sessionId: string; status: string }> {
    try {
      // Mock mode for testing
      if (MOCK_MODE) {
        const sessionId = uuidv4();
        const sessionData: SessionData = {
          id: sessionId,
          phoneNumber,
          platform: platform as "blinkit" | "zepto" | "instamart",
          cookies: [],
          currentUrl: getPlatformConfig(platform).baseUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
          isAuthenticated: false,
        };

        await dbManager.saveSession(sessionData);
        await dbManager.setSessionCache(sessionId, sessionData);

        return { sessionId, status: "OTP_SENT" };
      }

      const config = getPlatformConfig(platform);
      const sessionId = uuidv4();

      const sessionData: SessionData = {
        id: sessionId,
        phoneNumber,
        platform: platform as "blinkit" | "zepto" | "instamart",
        cookies: [],
        currentUrl: config.baseUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        isAuthenticated: false,
      };

      await dbManager.saveSession(sessionData);
      await dbManager.setSessionCache(sessionId, sessionData);

      await browserManager.restoreSession(sessionId, sessionData);

      await browserManager.navigate(sessionId, config.baseUrl);

      await browserManager.waitForSelector(
        sessionId,
        config.selectors.loginButton
      );
      await browserManager.click(sessionId, config.selectors.loginButton);

      await browserManager.waitForSelector(
        sessionId,
        config.selectors.phoneInput
      );
      await browserManager.type(
        sessionId,
        config.selectors.phoneInput,
        phoneNumber
      );

      await browserManager.click(sessionId, config.selectors.submitButton);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const cookies = await browserManager.getSessionCookies(sessionId);
      const currentUrl = await browserManager.getCurrentUrl(sessionId);
      const domSnapshot = await browserManager.getDOMSnapshot(sessionId);

      const updatedSession: SessionData = {
        ...sessionData,
        cookies,
        currentUrl,
        domSnapshot,
        updatedAt: new Date(),
      };

      await dbManager.saveSession(updatedSession);
      await dbManager.setSessionCache(sessionId, updatedSession);

      return { sessionId, status: "OTP_SENT" };
    } catch (error) {
      console.error("Login initiation error:", error);
      throw new Error(`Failed to initiate login: ${error.message}`);
    }
  }

  async submitOTP(otp: string, sessionId: string): Promise<SessionData> {
    try {
      if (MOCK_MODE) {
        const sessionData = await dbManager.getSessionCache(sessionId);
        if (!sessionData) {
          throw new Error("Session not found");
        }

        const updatedSession: SessionData = {
          ...sessionData,
          isAuthenticated: true,
          updatedAt: new Date(),
        };

        await dbManager.saveSession(updatedSession);
        await dbManager.setSessionCache(sessionId, updatedSession);

        return updatedSession;
      }

      let sessionData = await dbManager.getSessionCache(sessionId);
      if (!sessionData) {
        sessionData = await dbManager.getSession(sessionId);
      }
      if (!sessionData) {
        throw new Error("Session not found");
      }

      const config = getPlatformConfig(sessionData.platform);

      await browserManager.restoreSession(sessionId, sessionData);

      await browserManager.waitForSelector(
        sessionId,
        config.selectors.otpInput
      );
      await browserManager.type(sessionId, config.selectors.otpInput, otp);

      await browserManager.click(sessionId, config.selectors.otpSubmitButton);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const cookies = await browserManager.getSessionCookies(sessionId);
      const currentUrl = await browserManager.getCurrentUrl(sessionId);
      const domSnapshot = await browserManager.getDOMSnapshot(sessionId);

      const updatedSession: SessionData = {
        ...sessionData,
        cookies,
        currentUrl,
        domSnapshot,
        isAuthenticated: true,
        updatedAt: new Date(),
      };

      await dbManager.saveSession(updatedSession);
      await dbManager.setSessionCache(sessionId, updatedSession);

      return updatedSession;
    } catch (error) {
      console.error("OTP submission error:", error);
      throw new Error(`Failed to submit OTP: ${error.message}`);
    }
  }

  async addProductsToCart(request: AddProductsRequest): Promise<CartDetails> {
    try {
      const { sessionId, productUrls, variants } = request;

      if (MOCK_MODE) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockItems = mockCartItems.map((item, index) => ({
          ...item,
          productId: `mock-product-${index + 1}`,
          price: item.price + Math.floor(Math.random() * 20),
        }));

        const subtotal = mockItems.reduce((sum, item) => sum + item.price, 0);
        const deliveryFee = 20;
        const taxes = subtotal * 0.06; // 6% tax
        const total = subtotal + deliveryFee + taxes;

        return {
          items: mockItems,
          subtotal,
          deliveryFee,
          taxes,
          total,
          currency: "INR",
        };
      }

      let sessionData = await dbManager.getSessionCache(sessionId);
      if (!sessionData) {
        sessionData = await dbManager.getSession(sessionId);
      }
      if (!sessionData) {
        throw new Error("Session not found");
      }

      if (!sessionData.isAuthenticated) {
        throw new Error("Session not authenticated");
      }

      const config = getPlatformConfig(sessionData.platform);

      await browserManager.restoreSession(sessionId, sessionData);

      for (const productUrl of productUrls) {
        await this.addSingleProductToCart(
          sessionId,
          productUrl,
          variants,
          config
        );
      }

      const cartDetails = await this.extractCartDetails(sessionId, config);

      return cartDetails;
    } catch (error) {
      console.error("Add products error:", error);
      throw new Error(`Failed to add products: ${error.message}`);
    }
  }

  private async addSingleProductToCart(
    sessionId: string,
    productUrl: string,
    variants: Record<string, string>,
    config: any
  ): Promise<void> {
    await browserManager.navigate(sessionId, productUrl);

    const productId = this.extractProductIdFromUrl(productUrl);
    const desiredVariant = variants[productId];

    if (desiredVariant) {
      await browserManager.waitForSelector(
        sessionId,
        config.selectors.variantSelector
      );

      await browserManager.evaluate(sessionId, () => {
        const variantElements = document.querySelectorAll(
          config.selectors.variantSelector
        );
        for (const element of variantElements) {
          if (element.textContent.includes(desiredVariant)) {
            element.click();
            return true;
          }
        }
        return false;
      });
    }

    await browserManager.waitForSelector(
      sessionId,
      config.selectors.addToCartButton
    );
    await browserManager.click(sessionId, config.selectors.addToCartButton);

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async extractCartDetails(
    sessionId: string,
    config: any
  ): Promise<CartDetails> {
    await browserManager.click(sessionId, config.selectors.cartButton);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract cart information
    const cartData = await browserManager.evaluate(sessionId, () => {
      const items = [];
      const itemElements = document.querySelectorAll(
        '.cart-item, [data-testid="cart-item"]'
      );

      for (const element of itemElements) {
        const nameElement = element.querySelector(
          '.product-name, [data-testid="product-name"]'
        );
        const priceElement = element.querySelector(
          '.product-price, [data-testid="product-price"]'
        );
        const quantityElement = element.querySelector(
          '.quantity, [data-testid="quantity"]'
        );

        items.push({
          name: nameElement?.textContent?.trim() || "",
          price: parseFloat(
            priceElement?.textContent?.replace(/[^\d.]/g, "") || "0"
          ),
          quantity: parseInt(quantityElement?.textContent || "1"),
          weight: "",
        });
      }

      const subtotalElement = document.querySelector(
        '.subtotal, [data-testid="subtotal"]'
      );
      const deliveryFeeElement = document.querySelector(
        '.delivery-fee, [data-testid="delivery-fee"]'
      );
      const totalElement = document.querySelector(
        '.total, [data-testid="total"]'
      );

      return {
        items,
        subtotal: parseFloat(
          subtotalElement?.textContent?.replace(/[^\d.]/g, "") || "0"
        ),
        deliveryFee: parseFloat(
          deliveryFeeElement?.textContent?.replace(/[^\d.]/g, "") || "0"
        ),
        total: parseFloat(
          totalElement?.textContent?.replace(/[^\d.]/g, "") || "0"
        ),
      };
    });

    return {
      items: cartData.items,
      subtotal: cartData.subtotal,
      deliveryFee: cartData.deliveryFee,
      taxes: 0, // Calculate if available
      total: cartData.total,
      currency: "INR",
    };
  }

  private extractProductIdFromUrl(url: string): string {
    // Extract product ID from various URL formats
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "";
  }

  async cleanupSession(sessionId: string): Promise<void> {
    try {
      await browserManager.closeSession(sessionId);
      await dbManager.deleteSessionCache(sessionId);
      await dbManager.deleteSession(sessionId);
    } catch (error) {
      console.error("Session cleanup error:", error);
    }
  }
}


const automationService = new AutomationService();

export default automationService;
