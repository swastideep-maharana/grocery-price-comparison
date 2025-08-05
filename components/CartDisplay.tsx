"use client";

import { CartDetails } from "@/types";

interface CartDisplayProps {
  cartDetails: CartDetails;
  onReset: () => void;
}

export default function CartDisplay({
  cartDetails,
  onReset,
}: CartDisplayProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cartDetails.currency,
    }).format(price);
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Cart Summary</h2>
        <p className="text-gray-600 mt-1">
          All your product and pricing details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                🛍️ Cart Items ({cartDetails.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {cartDetails.items.map((item, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="text-base font-medium text-gray-900">
                        {item.name || `Item #${index + 1}`}
                      </h4>
                      {item.weight && (
                        <p className="text-sm text-gray-500">
                          Weight: {item.weight}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatPrice(item.price)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-400">
                          {formatPrice(item.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Price Breakdown & Actions */}
        <div className="space-y-6">
          {/* Breakdown */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                💵 Price Breakdown
              </h3>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatPrice(cartDetails.subtotal)}
                </span>
              </div>
              {cartDetails.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {formatPrice(cartDetails.deliveryFee)}
                  </span>
                </div>
              )}
              {cartDetails.taxes > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">
                    {formatPrice(cartDetails.taxes)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-green-600">
                  {formatPrice(cartDetails.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Savings */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              💰 Potential Savings
            </h4>
            <p className="text-sm text-green-800">
              Compare this total with other platforms to find better deals!
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onReset}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition"
            >
              🔁 Compare Another Platform
            </button>

            <button
              onClick={() => window.print()}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition"
            >
              🖨️ Print Summary
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2">
            📊 Cart Analysis
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Total Items: {cartDetails.items.length}</li>
            <li>
              • Average Item Price:{" "}
              {formatPrice(cartDetails.subtotal / cartDetails.items.length)}
            </li>
            <li>
              • Delivery Fee:{" "}
              {cartDetails.deliveryFee > 0
                ? formatPrice(cartDetails.deliveryFee)
                : "Free"}
            </li>
            <li>• Final Total: {formatPrice(cartDetails.total)}</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-base font-semibold text-purple-900 mb-2">
            💡 Smart Tips
          </h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Compare prices across platforms</li>
            <li>• Look for bulk purchase discounts</li>
            <li>• Check delivery timeframes</li>
            <li>• Save your cart for future shopping</li>
          </ul>
        </div>
      </div>

      {/* Export Section */}
      <div className="mt-10 bg-gray-50 rounded-lg p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          📤 Export Cart
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              const data = JSON.stringify(cartDetails, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cart-summary.json";
              a.click();
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-800"
          >
            🧾 Export as JSON
          </button>

          <button
            onClick={() => {
              const csv = [
                ["Item", "Price", "Quantity", "Total"],
                ...cartDetails.items.map((item) => [
                  item.name,
                  formatPrice(item.price),
                  item.quantity.toString(),
                  formatPrice(item.price * item.quantity),
                ]),
                ["", "", "Subtotal", formatPrice(cartDetails.subtotal)],
                ["", "", "Delivery Fee", formatPrice(cartDetails.deliveryFee)],
                ["", "", "Total", formatPrice(cartDetails.total)],
              ]
                .map((row) => row.join(","))
                .join("\n");

              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cart-summary.csv";
              a.click();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
          >
            📈 Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
