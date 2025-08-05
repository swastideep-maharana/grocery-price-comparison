# 🛒 Grocery Price Comparison App

A Next.js application that automates login, OTP verification, product selection, and cart price extraction for grocery price comparison across multiple platforms (Blinkit, Zepto, and Instamart).

## 🚀 Features

- **Multi-Platform Support**: Automated interaction with Blinkit, Zepto, and Instamart
- **Headless Browser Automation**: Uses Puppeteer for seamless web automation
- **Session Management**: Persistent session handling with Redis and MongoDB
- **OTP Verification**: Automated OTP submission and verification
- **Product Management**: Add multiple products with variant selection
- **Price Extraction**: Automated cart price calculation and breakdown
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Progress**: Step-by-step progress tracking
- **Export Options**: Export cart data as JSON or CSV

## 🏗️ Architecture

The application follows a three-layer architecture:

1. **API Layer**: Next.js API routes for login, OTP, and product management
2. **Automation Layer**: Puppeteer-based browser automation with session management
3. **Data Persistence**: Redis for caching and MongoDB for long-term storage

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Redis (local or cloud)
- Chrome/Chromium browser (for Puppeteer)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd grocery-price-comparison-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/grocery-comparison
   REDIS_URL=redis://localhost:6379

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h

   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # Grocery Platform URLs
   BLINKIT_URL=https://blinkit.com
   ZEPTO_URL=https://zepto.in
   INSTAMART_URL=https://www.instamart.in

   # Browser Configuration
   HEADLESS_BROWSER=true
   BROWSER_TIMEOUT=30000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### MongoDB

```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongosh
use grocery-comparison
```

### Redis

```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 📚 API Documentation

### 1. Login API

**Endpoint**: `POST /api/login`

**Request Body**:

```json
{
  "phoneNumber": "9876543210",
  "platform": "blinkit"
}
```

**Response**:

```json
{
  "status": "OTP_SENT",
  "message": "OTP has been sent to the provided phone number.",
  "sessionId": "uuid-session-id"
}
```

### 2. OTP Submission API

**Endpoint**: `POST /api/submit-otp`

**Request Body**:

```json
{
  "otp": "123456",
  "sessionId": "uuid-session-id"
}
```

**Response**:

```json
{
  "status": "SUCCESS",
  "message": "User authenticated and session saved.",
  "sessionData": {
    "id": "uuid-session-id",
    "phoneNumber": "9876543210",
    "platform": "blinkit",
    "cookies": [...],
    "currentUrl": "https://blinkit.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isAuthenticated": true
  }
}
```

### 3. Add Products API

**Endpoint**: `POST /api/add-products`

**Request Body**:

```json
{
  "sessionId": "uuid-session-id",
  "productUrls": [
    "https://blinkit.com/p/product-1",
    "https://blinkit.com/p/product-2"
  ],
  "variants": {
    "0": "1kg",
    "1": "500g"
  }
}
```

**Response**:

```json
{
  "cartDetails": {
    "items": [
      {
        "productId": "product-1",
        "name": "Product Name",
        "price": 100,
        "quantity": 1,
        "weight": "1kg"
      }
    ],
    "subtotal": 100,
    "deliveryFee": 20,
    "taxes": 0,
    "total": 120,
    "currency": "INR"
  },
  "finalPrice": 120,
  "status": "SUCCESS"
}
```

## 🔧 Configuration

### Platform Selectors

The application uses CSS selectors for automation. These can be configured in `config/platforms.ts`:

```typescript
export const platformConfigs = {
  blinkit: {
    name: "blinkit",
    baseUrl: "https://blinkit.com",
    selectors: {
      loginButton: '[data-testid="login-button"]',
      phoneInput: 'input[type="tel"]',
      submitButton: 'button[type="submit"]',
      // ... more selectors
    },
  },
  // ... other platforms
};
```

### Browser Configuration

Browser settings can be modified in `lib/browser.ts`:

```typescript
const browser = await puppeteer.launch({
  headless: process.env.HEADLESS_BROWSER === "true",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    // ... more arguments
  ],
});
```

##  Usage

### 1. Login Process

1. Select your preferred grocery platform (Blinkit, Zepto, or Instamart)
2. Enter your phone number
3. Click "Send OTP"
4. Enter the 6-digit OTP received on your phone
5. Click "Verify OTP"

### 2. Add Products

1. Enter product URLs from the selected platform
2. Optionally specify product variants/weights
3. Add multiple products as needed
4. Click "Add to Cart & Compare Prices"

### 3. View Results

- Review cart items and pricing
- Export data as JSON or CSV
- Compare with other platforms
- Print summary for reference

##  Security Considerations

- **Session Management**: Sessions are stored securely with expiration
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling prevents data leaks
- **Rate Limiting**: API endpoints include rate limiting
- **CSP Bypass**: Content Security Policy is handled appropriately

##  Performance Optimizations

- **Resource Blocking**: Non-essential resources (fonts, images, CSS) are blocked
- **Session Caching**: Redis caching for faster session retrieval
- **Concurrent Processing**: Multiple browser tabs for parallel product processing
- **Memory Management**: Proper cleanup of browser sessions

"# grocery-price-comparison" 
"# grocery-price-comparison" 
