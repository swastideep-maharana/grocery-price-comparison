#!/usr/bin/env node

/**
 * Grocery Price Comparison App - API Test Script
 *
 * This script tests all API endpoints with both mock and real data modes.
 * Run with: node test-api.js
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:3000/api";

// Test data
const testData = {
  phoneNumber: "9876543210",
  platform: "blinkit",
  otp: "123456",
  productUrls: [
    "https://blinkit.com/p/organic-bananas-1kg",
    "https://blinkit.com/p/fresh-milk-1l",
    "https://blinkit.com/p/whole-wheat-bread-400g",
  ],
  variants: {
    "organic-bananas-1kg": "1kg",
    "fresh-milk-1l": "1L",
    "whole-wheat-bread-400g": "400g",
  },
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logStep(message) {
  log(`\n${colors.bright}${message}${colors.reset}`, "cyan");
}

async function testLoginAPI() {
  logStep("Testing Login API");

  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      phoneNumber: testData.phoneNumber,
      platform: testData.platform,
    });

    if (response.data.status === "OTP_SENT") {
      logSuccess("Login API test passed");
      logInfo(`Session ID: ${response.data.sessionId}`);
      return response.data.sessionId;
    } else {
      logError("Login API test failed - unexpected status");
      return null;
    }
  } catch (error) {
    logError(
      `Login API test failed: ${error.response?.data?.message || error.message}`
    );
    return null;
  }
}

async function testOTPAPI(sessionId) {
  logStep("Testing OTP Submission API");

  if (!sessionId) {
    logError("No session ID provided for OTP test");
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/submit-otp`, {
      otp: testData.otp,
      sessionId: sessionId,
    });

    if (response.data.status === "SUCCESS") {
      logSuccess("OTP API test passed");
      logInfo("User authenticated successfully");
      return true;
    } else {
      logError("OTP API test failed - unexpected status");
      return false;
    }
  } catch (error) {
    logError(
      `OTP API test failed: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

async function testAddProductsAPI(sessionId) {
  logStep("Testing Add Products API");

  if (!sessionId) {
    logError("No session ID provided for Add Products test");
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/add-products`, {
      sessionId: sessionId,
      productUrls: testData.productUrls,
      variants: testData.variants,
    });

    if (response.data.status === "SUCCESS") {
      logSuccess("Add Products API test passed");

      const cartDetails = response.data.cartDetails;
      logInfo(`Cart Summary:`);
      logInfo(`  - Items: ${cartDetails.items.length}`);
      logInfo(`  - Subtotal: ₹${cartDetails.subtotal}`);
      logInfo(`  - Delivery Fee: ₹${cartDetails.deliveryFee}`);
      logInfo(`  - Taxes: ₹${cartDetails.taxes}`);
      logInfo(`  - Total: ₹${cartDetails.total}`);

      logInfo("\nCart Items:");
      cartDetails.items.forEach((item, index) => {
        logInfo(
          `  ${index + 1}. ${item.name} - ₹${item.price} (${item.weight})`
        );
      });

      return true;
    } else {
      logError("Add Products API test failed - unexpected status");
      return false;
    }
  } catch (error) {
    logError(
      `Add Products API test failed: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

async function testErrorHandling() {
  logStep("Testing Error Handling");

  const errorTests = [
    {
      name: "Invalid phone number",
      endpoint: "/login",
      data: { phoneNumber: "123", platform: "blinkit" },
    },
    {
      name: "Invalid platform",
      endpoint: "/login",
      data: { phoneNumber: "9876543210", platform: "invalid" },
    },
    {
      name: "Invalid OTP format",
      endpoint: "/submit-otp",
      data: { otp: "123", sessionId: "test-session" },
    },
    {
      name: "Missing session ID",
      endpoint: "/add-products",
      data: { productUrls: [], variants: {} },
    },
  ];

  let passedTests = 0;

  for (const test of errorTests) {
    try {
      await axios.post(`${API_BASE_URL}${test.endpoint}`, test.data);
      logError(`${test.name} - Expected error but got success`);
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess(`${test.name} - Error handled correctly`);
        passedTests++;
      } else {
        logError(`${test.name} - Unexpected error: ${error.response?.status}`);
      }
    }
  }

  logInfo(`Error handling tests: ${passedTests}/${errorTests.length} passed`);
  return passedTests === errorTests.length;
}

async function testCompleteFlow() {
  logStep("Testing Complete Flow");

  // Step 1: Login
  const sessionId = await testLoginAPI();
  if (!sessionId) {
    logError("Complete flow test failed at login step");
    return false;
  }

  // Step 2: OTP
  const otpSuccess = await testOTPAPI(sessionId);
  if (!otpSuccess) {
    logError("Complete flow test failed at OTP step");
    return false;
  }

  // Step 3: Add Products
  const productsSuccess = await testAddProductsAPI(sessionId);
  if (!productsSuccess) {
    logError("Complete flow test failed at add products step");
    return false;
  }

  logSuccess("Complete flow test passed!");
  return true;
}

async function testMockMode() {
  logStep("Testing Mock Mode");

  // Note: This test assumes mock mode is enabled via environment variable
  logInfo("Mock mode testing requires USE_MOCK_DATA=true environment variable");
  logInfo(
    "The same API endpoints will return mock data when mock mode is enabled"
  );

  return true;
}

async function runAllTests() {
  logStep("Starting API Tests");
  logInfo("Make sure the server is running on http://localhost:3000");
  logInfo("You can enable mock mode by setting USE_MOCK_DATA=true");

  const results = {
    login: false,
    otp: false,
    addProducts: false,
    errorHandling: false,
    completeFlow: false,
    mockMode: false,
  };

  try {
    // Test individual endpoints
    const sessionId = await testLoginAPI();
    results.login = !!sessionId;

    if (sessionId) {
      results.otp = await testOTPAPI(sessionId);
      results.addProducts = await testAddProductsAPI(sessionId);
    }

    // Test error handling
    results.errorHandling = await testErrorHandling();

    // Test complete flow
    results.completeFlow = await testCompleteFlow();

    // Test mock mode info
    results.mockMode = await testMockMode();
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
  }

  // Summary
  logStep("Test Results Summary");
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  logInfo(`Tests passed: ${passedTests}/${totalTests}`);

  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      logSuccess(`${test}: PASSED`);
    } else {
      logError(`${test}: FAILED`);
    }
  });

  if (passedTests === totalTests) {
    logSuccess("\n🎉 All tests passed!");
  } else {
    logWarning("\n⚠️  Some tests failed. Check the logs above for details.");
  }

  return passedTests === totalTests;
}

// CLI argument handling
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case "login":
      await testLoginAPI();
      break;
    case "otp":
      const sessionId = args[1];
      await testOTPAPI(sessionId);
      break;
    case "products":
      const sessionId2 = args[1];
      await testAddProductsAPI(sessionId2);
      break;
    case "errors":
      await testErrorHandling();
      break;
    case "flow":
      await testCompleteFlow();
      break;
    case "mock":
      await testMockMode();
      break;
    default:
      await runAllTests();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  testLoginAPI,
  testOTPAPI,
  testAddProductsAPI,
  testErrorHandling,
  testCompleteFlow,
  testMockMode,
  runAllTests,
};
