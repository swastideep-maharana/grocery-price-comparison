import { NextRequest, NextResponse } from "next/server";
import {
  AddProductsRequest,
  AddProductsResponse,
  ErrorResponse,
} from "@/types";

// Simulate fetching product details for each URL
const mockFetchProductDetails = async (url: string, variant?: string) => {
  const productId = url.split("/").pop() || "unknown-product";
  const randomPrice = Math.floor(Math.random() * 100) + 20;

  return {
    name: decodeURIComponent(productId.replace(/[-_]/g, " ")),
    price: randomPrice,
    quantity: 1,
    productId,
    weight: variant || "Standard",
  };
};

export async function POST(
  request: NextRequest
): Promise<NextResponse<AddProductsResponse | ErrorResponse>> {
  try {
    const body: AddProductsRequest = await request.json();
    const { sessionId, productUrls, variants } = body;

    if (!sessionId || !productUrls || !variants) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Session ID, product URLs, and variants are required",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(productUrls) || productUrls.length === 0) {
      return NextResponse.json(
        { status: "ERROR", message: "Product URLs must be a non-empty array" },
        { status: 400 }
      );
    }

    if (typeof variants !== "object" || Object.keys(variants).length === 0) {
      return NextResponse.json(
        { status: "ERROR", message: "Variants must be a non-empty object" },
        { status: 400 }
      );
    }

    // Validate URLs
    for (const url of productUrls) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { status: "ERROR", message: `Invalid URL: ${url}` },
          { status: 400 }
        );
      }
    }

    // 🧠 Simulate product scraping
    const items = await Promise.all(
      productUrls.map((url, idx) =>
        mockFetchProductDetails(url, variants[idx.toString()])
      )
    );

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const deliveryFee = 25;
    const taxes = Math.floor(subtotal * 0.05);
    const total = subtotal + deliveryFee + taxes;

    const cartDetails = {
      currency: "INR",
      subtotal,
      deliveryFee,
      taxes,
      total,
      items,
    };

    const response: AddProductsResponse = {
      cartDetails,
      finalPrice: total,
      status: "SUCCESS",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    const errorResponse: ErrorResponse = {
      status: "ERROR",
      message: errorMessage,
      code: "ADD_PRODUCTS_FAILED",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
