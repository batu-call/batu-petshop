"use client";
import React from "react";

type Features = { name: string; description: string };

interface ProductFeaturesProps {
  features: Features[];
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ features }) => {
  return (
    <div className="mx-auto max-w-[800px] px-6 py-4">
      <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
        Product Features
      </h2>
      <div className="text-xl md:text-2xl text-color text-jost leading-relaxed mb-12">
        {features && features.length > 0 ? (
          <ul className="list-disc list-inside space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="text-color">
                <strong className="text-color opacity-90 font-semibold mb-2 text-shadow-2xs">
                  {feature.name}
                </strong>
                <p className="text-color">{feature.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 mt-4">
            {features[0]?.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductFeatures;