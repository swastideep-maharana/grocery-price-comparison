import puppeteer, { Browser, Page, BrowserContext } from "puppeteer";
import { SessionData, PlatformConfig, BrowserSession } from "@/types";
import { getPlatformConfig } from "@/config/platforms";

class BrowserManager {
  private browser: Browser | null = null;
  private activeSessions: Map<string, BrowserSession> = new Map();

  async initializeBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: process.env.HEADLESS_BROWSER === "true",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
        ],
        defaultViewport: { width: 1920, height: 1080 },
      });
    }
    return this.browser;
  }

  async createContext(sessionId: string): Promise<BrowserContext> {
    const browser = await this.initializeBrowser();
    const context = await browser.createIncognitoBrowserContext();

    // Block non-essential resources for performance
    await context.setRequestInterception(true);
    context.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["font", "image", "stylesheet", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Bypass CSP
    await context.addInitScript(() => {
      // Remove CSP headers
      const originalFetch = window.fetch;
      window.fetch = function (...args) {
        const [url, options = {}] = args;
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            "Content-Security-Policy": "",
          },
        };
        return originalFetch(url, newOptions);
      };
    });

    return context;
  }

  async createPage(context: BrowserContext): Promise<Page> {
    const page = await context.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set timeout
    const timeout = parseInt(process.env.BROWSER_TIMEOUT || "30000");
    page.setDefaultTimeout(timeout);

    return page;
  }

  async restoreSession(
    sessionId: string,
    sessionData: SessionData
  ): Promise<BrowserSession> {
    // Check if session already exists
    const existingSession = this.activeSessions.get(sessionId);
    if (existingSession && existingSession.isActive) {
      return existingSession;
    }

    // Create new context and page
    const context = await this.createContext(sessionId);
    const page = await this.createPage(context);

    // Restore cookies
    if (sessionData.cookies && sessionData.cookies.length > 0) {
      await page.setCookie(...sessionData.cookies);
    }

    // Navigate to the saved URL
    if (sessionData.currentUrl) {
      await page.goto(sessionData.currentUrl, { waitUntil: "networkidle2" });
    }

    const browserSession: BrowserSession = {
      page,
      context,
      isActive: true,
    };

    this.activeSessions.set(sessionId, browserSession);
    return browserSession;
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      await session.page.close();
      await session.context.close();
      this.activeSessions.delete(sessionId);
    }
  }

  async getSessionCookies(sessionId: string): Promise<any[]> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return await session.page.cookies();
  }

  async getCurrentUrl(sessionId: string): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session.page.url();
  }

  async getDOMSnapshot(sessionId: string): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return await session.page.content();
  }

  async waitForSelector(
    sessionId: string,
    selector: string,
    timeout?: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    await session.page.waitForSelector(selector, { timeout });
  }

  async click(sessionId: string, selector: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    await session.page.click(selector);
  }

  async type(sessionId: string, selector: string, text: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    await session.page.type(selector, text);
  }

  async navigate(sessionId: string, url: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    await session.page.goto(url, { waitUntil: "networkidle2" });
  }

  async evaluate(sessionId: string, fn: () => any): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return await session.page.evaluate(fn);
  }

  async screenshot(sessionId: string, path?: string): Promise<Buffer> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return await session.page.screenshot({ path, fullPage: true });
  }

  async close(): Promise<void> {
    // Close all active sessions
    for (const [sessionId] of this.activeSessions) {
      await this.closeSession(sessionId);
    }

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
const browserManager = new BrowserManager();

export default browserManager;
