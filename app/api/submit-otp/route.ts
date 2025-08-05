import { NextRequest, NextResponse } from "next/server";
import { OTPRequest, OTPResponse, ErrorResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<OTPResponse | ErrorResponse>> {
  try {
    const body: OTPRequest = await request.json();
    const { otp, sessionId } = body;

    if (!otp || !sessionId) {
      return NextResponse.json(
        { status: "ERROR", message: "OTP and session ID are required" },
        { status: 400 }
      );
    }

    if (otp !== "123456") {
      return NextResponse.json(
        { status: "ERROR", message: "Invalid OTP. Try '123456'" },
        { status: 401 }
      );
    }

    const response: OTPResponse = {
      status: "SUCCESS",
      message: "Demo OTP validated successfully.",
      sessionData: {
        id: sessionId,
        phoneNumber: "7978219600",
        platform: "blinkit",
        cookies: [],
        currentUrl: "https://example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
        isAuthenticated: true,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Demo OTP Submit Error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Something went wrong",
        code: "OTP_SUBMISSION_FAILED",
      },
      { status: 500 }
    );
  }
}
