"use client";

import { useState, useRef, useEffect } from "react";
import { SessionData } from "@/types";

interface OTPFormProps {
  sessionId: string;
  onSuccess: (session: SessionData) => void;
  onLoading: (loading: boolean) => void;
}

export default function OTPForm({
  sessionId,
  onSuccess,
  onLoading,
}: OTPFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      onLoading(true);
      const response = await fetch("/api/submit-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpString, sessionId }),
      });

      const data = await response.json();

      if (data.status === "SUCCESS" && data.sessionData) {
        onSuccess(data.sessionData);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("OTP submission error:", err);
    } finally {
      onLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      onLoading(true);
      setError("");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: "", // Optional: pass phoneNumber if needed
          platform: "blinkit",
        }),
      });

      const data = await response.json();
      if (data.status === "OTP_SENT") {
        setResendTimer(30);
        setError("");
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Resend OTP error:", err);
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📱</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to your phone number
        </p>
        <p className="text-gray-600">use 123456 as OTP</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter 6-digit OTP
          </label>
          <div className="flex justify-center space-x-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                value={digit}
                onChange={(e) =>
                  handleOtpChange(index, e.target.value.replace(/\D/g, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-lg font-semibold"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={otp.join("").length !== 6}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Verify OTP
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendTimer > 0}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Check your SMS inbox for the OTP</li>
          <li>• The code expires in 10 minutes</li>
          <li>• Make sure you're using the same phone number</li>
        </ul>
      </div>
    </div>
  );
}
