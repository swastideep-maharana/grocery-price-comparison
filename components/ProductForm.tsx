"use client";

import { useState } from "react";
import { CartDetails } from "@/types";

interface ProductFormProps {
  sessionId: string;
  platform: "blinkit" | "zepto" | "instamart";
  onSuccess: (cart: CartDetails) => void;
  onLoading: (loading: boolean) => void;
}

interface ProductEntry {
  id: string;
  url: string;
  variant: string;
}

export default function ProductForm({
  sessionId,
  platform,
  onSuccess,
  onLoading,
}: ProductFormProps) {
  const [products, setProducts] = useState<ProductEntry[]>([
    { id: "1", url: "", variant: "" },
  ]);
  const [error, setError] = useState("");

  const addProduct = () => {
    const newId = (products.length + 1).toString();
    setProducts([...products, { id: newId, url: "", variant: "" }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const updateProduct = (
    id: string,
    field: "url" | "variant",
    value: string
  ) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const validateForm = () => {
    for (const product of products) {
      if (!product.url.trim()) {
        setError("Please enter product URLs for all items");
        return false;
      }
      try {
        new URL(product.url);
      } catch {
        setError("Please enter valid URLs for all products");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      onLoading(true);

      // Convert products to the format expected by the API
      const productUrls = products.map((p) => p.url.trim());
      const variants: Record<string, string> = {};

      products.forEach((product, index) => {
        if (product.variant.trim()) {
          variants[index.toString()] = product.variant.trim();
        }
      });

      const response = await fetch("/api/add-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          productUrls,
          variants,
        }),
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        onSuccess(data.cartDetails);
      } else {
        setError(data.message || "Failed to add products to cart");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Add products error:", err);
    } finally {
      onLoading(false);
    }
  };

  const getPlatformInfo = () => {
    switch (platform) {
      case "blinkit":
        return {
          name: "Blinkit",
          icon: "🛒",
          color: "blue",
          example: "https://blinkit.com/p/product-name",
        };
      case "zepto":
        return {
          name: "Zepto",
          icon: "⚡",
          color: "green",
          example: "https://zepto.in/p/product-name",
        };
      case "instamart":
        return {
          name: "Instamart",
          icon: "🚚",
          color: "purple",
          example: "https://www.instamart.in/p/product-name",
        };
    }
  };

  const platformInfo = getPlatformInfo();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 bg-${platformInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <span className="text-2xl">{platformInfo.icon}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add Products</h2>
        <p className="text-gray-600">
          Add product URLs from {platformInfo.name} to compare prices
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product List */}
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">
                  Product {index + 1}
                </h3>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product URL
                  </label>
                  <input
                    type="url"
                    value={product.url}
                    onChange={(e) =>
                      updateProduct(product.id, "url", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={platformInfo.example}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant/Weight (Optional)
                  </label>
                  <input
                    type="text"
                    value={product.variant}
                    onChange={(e) =>
                      updateProduct(product.id, "variant", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1kg, 500g, Large"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addProduct}
          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Add Another Product
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
        >
          Add to Cart & Compare Prices
        </button>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          📋 Instructions
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Copy the product URL from {platformInfo.name}</li>
          <li>
            • Specify the variant/weight if the product has multiple options
          </li>
          <li>
            • We'll automatically add products to your cart and extract prices
          </li>
          <li>• You can add multiple products to compare total cart values</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          💡 {platformInfo.name} Tips
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Make sure you're logged into {platformInfo.name}</li>
          <li>• Use the exact product page URL</li>
          <li>• Check that the product is available in your area</li>
        </ul>
      </div>
    </div>
  );
}
