"use client";
import React from "react";

type Item = { _id: string; text: string };
type Section = { _id: string; title: string; items: Item[] };

interface Props {
  shippingFee: string;
  freeOver: string;
  sections: Section[];
}

const ShippingInfo: React.FC<Props> = ({ shippingFee, freeOver, sections }) => {
  if (sections.length === 0) return null;

  return (
    <div className="mx-auto max-w-[800px] px-6 py-4">
      {sections.map((section, idx) => (
        <div key={section._id}>
          <h2 className="text-color2 dark:text-[#0E5F44]! text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6 break-words text-center">
            {section.title}
          </h2>
          <div className={`text-xl md:text-2xl text-color dark:text-[#0b8457]! leading-relaxed ${idx < sections.length - 1 ? "mb-12" : ""}`}>
            <ul className="list-disc list-outside space-y-3 pl-6">
              {section.items.map((item) => (
                <li key={item._id} className="break-words leading-relaxed">
                  {item.text}
                </li>
              ))}
              {idx === 0 && (
                <>
                  {freeOver && Number(freeOver) > 0 && (
                    <li className="break-words leading-relaxed">
                      Free shipping on orders over ${freeOver}.
                    </li>
                  )}
                  {shippingFee && Number(shippingFee) > 0 && (
                    <li className="break-words leading-relaxed">
                      Standard flat rate shipping: ${shippingFee}.
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShippingInfo;