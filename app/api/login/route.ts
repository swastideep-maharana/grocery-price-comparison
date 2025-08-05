import { NextRequest, NextResponse } from "next/server";
import { LoginRequest, LoginResponse, ErrorResponse } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginResponse | ErrorResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { phoneNumber, platform } = body;

    if (!phoneNumber || !platform) {
      return NextResponse.json(
        { status: "ERROR", message: "Phone number and platform are required" },
        { status: 400 }
      );
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { status: "ERROR", message: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const sessionId = `demo-${Math.random().toString(36).substring(2, 12)}`;

    const response: LoginResponse = {
      status: "OTP_SENT",
      message: "Demo OTP '123456' has been sent.",
      sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Demo Login Error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        message: "Something went wrong",
        code: "LOGIN_FAILED",
      },
      { status: 500 }
    );
  }
}
