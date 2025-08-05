import { NextResponse } from "next/server";
import dbManager from "@/lib/database";

export async function GET() {
  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        mongodb: "disconnected",
        redis: "disconnected",
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        mockMode: process.env.USE_MOCK_DATA === "true",
        headlessBrowser: process.env.HEADLESS_BROWSER === "true",
      },
    };

    try {
      await dbManager.connectMongoDB();
      healthStatus.services.mongodb = "connected";
    } catch (error) {
      healthStatus.services.mongodb = "error";
      console.error("MongoDB health check failed:", error);
    }

    try {
      await dbManager.connectRedis();
      healthStatus.services.redis = "connected";
    } catch (error) {
      healthStatus.services.redis = "error";
      console.error("Redis health check failed:", error);
    }

    const allServicesHealthy =
      healthStatus.services.mongodb === "connected" &&
      healthStatus.services.redis === "connected";

    if (!allServicesHealthy) {
      healthStatus.status = "degraded";
    }

    return NextResponse.json(healthStatus, {
      status: allServicesHealthy ? 200 : 503,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: errorMessage,
        services: {
          mongodb: "unknown",
          redis: "unknown",
        },
      },
      { status: 500 }
    );
  }
}
