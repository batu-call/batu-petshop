"use client";
import React from "react";

const ShippingInfo: React.FC = () => {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-4">
      <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
        Returns Policy
      </h2>
      <div className="text-xl md:text-2xl text-color text-jost leading-relaxed mb-12">
        <ul className="list-disc list-inside space-y-3">
          <li>You can return your order within 14 days of delivery.</li>
          <li>
            Items must be unused, in their original packaging and in resellable
            condition.
          </li>
          <li>
            To start a return, please contact our customer service with your
            order details.
          </li>
          <li>
            Return shipping costs are the responsibility of the customer unless
            the product is defective.
          </li>
          <li>
            If you receive a damaged or incorrect product, please contact us
            within 48 hours of receiving your order.
          </li>
          <li>
            Once your return is approved and received, we will process your
            refund within 5–7 business days.
          </li>
        </ul>
      </div>
      <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
        Shipping Information
      </h2>
      <div className="text-xl md:text-2xl text-color text-jost leading-relaxed">
        <ul className="list-disc list-inside space-y-3">
          <li>Orders are processed within 1–3 business days.</li>
          <li>
            Delivery usually takes 3–7 business days depending on your location.
          </li>
          <li>We ship via xxx.</li>
          <li>Free shipping on orders over $100.</li>
        </ul>
      </div>
    </div>
  );
};

export default ShippingInfo;