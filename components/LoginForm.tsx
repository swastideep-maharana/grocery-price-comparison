"use client";

import { useState } from "react";
import { SessionData } from "@/types";

interface LoginFormProps {
  onSuccess: (session: SessionData) => void;
  onLoading: (loading: boolean) => void;
}

export default function LoginForm({ onSuccess, onLoading }: LoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [platform, setPlatform] = useState<"blinkit" | "zepto" | "instamart">(
    "blinkit"
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");


    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      onLoading(true);

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber,
          platform,
        }),
      });

      const data = await response.json();

      if (data.status === "OTP_SENT") {
      
        const tempSession: SessionData = {
          id: data.sessionId,
          phoneNumber,
          platform,
          cookies: [],
          currentUrl: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          isAuthenticated: false,
        };
        onSuccess(tempSession);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Login error:", err);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
        <p className="text-gray-600">
          Choose your preferred grocery platform and enter your phone number
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
    
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Platform
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "blinkit", name: "Blinkit", icon: "🛒", color: "blue" },
              { id: "zepto", name: "Zepto", icon: "⚡", color: "green" },
              {
                id: "instamart",
                name: "Instamart",
                icon: "🚚",
                color: "purple",
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id as any)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  platform === p.id
                    ? `border-${p.color}-500 bg-${p.color}-50`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="text-sm font-medium text-gray-900">
                  {p.name}
                </div>
              </button>
            ))}
          </div>
        </div>

       
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">+91</span>
            </div>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value.replace(/\D/g, ""))
              }
              className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
              maxLength={10}
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            We'll send you a 6-digit OTP to verify your number
          </p>
        </div>

   
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

       
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Send OTP
        </button>
      </form>

     
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          About {platform.charAt(0).toUpperCase() + platform.slice(1)}
        </h3>
        <p className="text-sm text-gray-600">
          {platform === "blinkit" &&
            "Get groceries delivered in 10 minutes with Blinkit's lightning-fast service."}
          {platform === "zepto" &&
            "Experience ultra-fast grocery delivery with Zepto's 10-minute promise."}
          {platform === "instamart" &&
            "Quick and reliable grocery delivery with Instamart's extensive product range."}
        </p>
      </div>
    </div>
  );
}
