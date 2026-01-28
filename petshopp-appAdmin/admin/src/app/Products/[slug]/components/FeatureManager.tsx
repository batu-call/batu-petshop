"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import CloseIcon from "@mui/icons-material/Close";

type Features = {
  name: string;
  description: string;
};

interface FeatureManagerProps {
  features: Features[];
  newFeature: Features;
  onFeatureUpdate: (index: number, field: "name" | "description", value: string) => void;
  onFeatureDelete: (index: number) => void;
  onNewFeatureChange: (field: "name" | "description", value: string) => void;
  onFeatureAdd: () => void;
}

const FeatureManager: React.FC<FeatureManagerProps> = ({
  features,
  newFeature,
  onFeatureUpdate,
  onFeatureDelete,
  onNewFeatureChange,
  onFeatureAdd,
}) => {
  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-color mb-4">
        Product Features
      </h2>

      {features.map((f, index) => (
        <div
          key={index}
          className="flex items-start gap-3 border-b py-2 mb-2 relative group"
        >
          <input
            value={f.name}
            onChange={(e) => onFeatureUpdate(index, "name", e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <textarea
            value={f.description}
            onChange={(e) => onFeatureUpdate(index, "description", e.target.value)}
            className="border p-2 rounded w-2/3"
          />

          <button
            onClick={() => onFeatureDelete(index)}
            className="absolute top-2 right-2
text-color cursor-pointer
opacity-100 lg:opacity-0 lg:group-hover:opacity-100
transition-all duration-300 hover:scale-110"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      ))}

      {/* Add new feature */}
      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <input
          placeholder="Feature name"
          value={newFeature.name}
          onChange={(e) => onNewFeatureChange("name", e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          placeholder="Feature description"
          value={newFeature.description}
          onChange={(e) => onNewFeatureChange("description", e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <Button
          onClick={onFeatureAdd}
          className="bg-secondary hover:bg-[#A8D1B5] text-color font-semibold px-6 transition duration-300 ease-in-out hover:scale-105 cursor-pointer"
        >
          Add Feature
        </Button>
      </div>
    </div>
  );
};

export default FeatureManager;