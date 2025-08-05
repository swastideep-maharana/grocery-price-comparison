"use client";

import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import OTPForm from "@/components/OTPForm";
import ProductForm from "@/components/ProductForm";
import CartDisplay from "@/components/CartDisplay";
import { SessionData, CartDetails } from "@/types";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<
    "login" | "otp" | "products" | "cart"
  >("login");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [cartDetails, setCartDetails] = useState<CartDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = (session: SessionData) => {
    setSessionData(session);
    setCurrentStep("products");
  };

  const handleProductsSuccess = (cart: CartDetails) => {
    setCartDetails(cart);
    setCurrentStep("cart");
  };

  const resetFlow = () => {
    setCurrentStep("login");
    setSessionData(null);
    setCartDetails(null);
  };

  return (
    <div className="space-y-8">
 
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center ${
              currentStep === "login" ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "login"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Login</span>
          </div>
          <div
            className={`w-12 h-0.5 ${
              currentStep === "otp" ||
              currentStep === "products" ||
              currentStep === "cart"
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
          />
          <div
            className={`flex items-center ${
              currentStep === "otp"
                ? "text-blue-600"
                : currentStep === "products" || currentStep === "cart"
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "otp"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : currentStep === "products" || currentStep === "cart"
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-300"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">OTP</span>
          </div>
          <div
            className={`w-12 h-0.5 ${
              currentStep === "products" || currentStep === "cart"
                ? "bg-green-600"
                : "bg-gray-300"
            }`}
          />
          <div
            className={`flex items-center ${
              currentStep === "products"
                ? "text-green-600"
                : currentStep === "cart"
                ? "text-purple-600"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "products"
                  ? "border-green-600 bg-green-600 text-white"
                  : currentStep === "cart"
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-300"
              }`}
            >
              3
            </div>
            <span className="ml-2 font-medium">Products</span>
          </div>
          <div
            className={`w-12 h-0.5 ${
              currentStep === "cart" ? "bg-purple-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`flex items-center ${
              currentStep === "cart" ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "cart"
                  ? "border-purple-600 bg-purple-600 text-white"
                  : "border-gray-300"
              }`}
            >
              4
            </div>
            <span className="ml-2 font-medium">Cart</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-8 animate-fade-in">
        {currentStep === "login" && (
          <LoginForm
            onSuccess={(session) => {
              setSessionData(session);
              setCurrentStep("otp");
            }}
            onLoading={setLoading}
          />
        )}

        {currentStep === "otp" && sessionData && (
          <OTPForm
            sessionId={sessionData.id}
            onSuccess={handleLoginSuccess}
            onLoading={setLoading}
          />
        )}

        {currentStep === "products" && sessionData && (
          <ProductForm
            sessionId={sessionData.id}
            platform={sessionData.platform}
            onSuccess={handleProductsSuccess}
            onLoading={setLoading}
          />
        )}

        {currentStep === "cart" && cartDetails && (
          <CartDisplay cartDetails={cartDetails} onReset={resetFlow} />
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {/* Platform Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Blinkit</h3>
              <p className="text-sm text-gray-500">10-minute delivery</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Zepto</h3>
              <p className="text-sm text-gray-500">10-minute delivery</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚚</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Instamart</h3>
              <p className="text-sm text-gray-500">Quick delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
