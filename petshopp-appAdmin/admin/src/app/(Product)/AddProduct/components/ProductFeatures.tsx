"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@/components/ui/button";
import { Features } from "../hooks/useAddProduct";
import { useConfirm } from "@/app/Context/confirmContext";

type Props = {
  productFeatures: Features[];
  feature: Features;
  setFeature: (f: Features) => void;
  uploading: boolean;
  handleAddFeature: () => void;
  handleDeleteFeature: (index: number) => void;
  updateFeatureInList: (index: number, field: keyof Features, value: string) => void;
};

const inputClass = "border dark:border-[#2d5a3d] p-2 rounded bg-white dark:bg-[#0d1f18] text-[#393E46] dark:text-[#c8e6d0] placeholder-gray-400 dark:placeholder-[#7aab8a] focus:outline-none focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] disabled:opacity-50";


const ProductFeatures = ({
  productFeatures,
  feature,
  setFeature,
  uploading,
  handleAddFeature,
  handleDeleteFeature,
  updateFeatureInList,
}: Props) => {
  const { confirm } = useConfirm();

  return (
    <div className="flex-1 bg-white dark:bg-[#1e3d2a] p-6 rounded-xl shadow-md border border-transparent dark:border-[#2d5a3d]">
      <h2 className="text-2xl font-bold text-color dark:text-[#c8e6d0]! mb-4">Product Features</h2>

      {productFeatures.map((f, index) => (
        <div key={index} className="flex items-start gap-3 border-b dark:border-[#2d5a3d] py-2 mb-2 relative group">
          <input
            value={f.name}
            onChange={(e) => updateFeatureInList(index, "name", e.target.value)}
            disabled={uploading}
            className={`${inputClass} w-1/3`}
          />
          <textarea
            value={f.description}
            onChange={(e) => updateFeatureInList(index, "description", e.target.value)}
            disabled={uploading}
            className={`${inputClass} w-2/3`}
          />
          <button
            onClick={async () => {
              const ok = await confirm({
                title: "Delete Feature",
                description: "Are you sure you want to delete this feature?",
                confirmText: "Yes, Delete",
                cancelText: "Cancel",
                variant: "destructive",
              });
              if (ok) handleDeleteFeature(index);
            }}
            disabled={uploading}
            className="absolute top-2 right-2 text-color dark:text-[#7aab8a] cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      ))}

      <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row gap-3 mt-4">
        <input
          placeholder="Feature name"
          value={feature.name}
          onChange={(e) => setFeature({ ...feature, name: e.target.value })}
          disabled={uploading}
          className={`${inputClass} flex-1`}
        />
        <input
          placeholder="Feature description"
          value={feature.description}
          onChange={(e) => setFeature({ ...feature, description: e.target.value })}
          disabled={uploading}
          className={`${inputClass} flex-1`}
        />
        <Button
          onClick={handleAddFeature}
          disabled={uploading}
          className="bg-primary dark:bg-[#0b8457]! hover:bg-[#A8D1B5] dark:hover:bg-[#2d5a3d] text-[#393E46] dark:text-[#c8e6d0] font-semibold transition duration-300 ease-in-out hover:scale-[1.05] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
        >
          Add Feature
        </Button>
      </div>
    </div>
  );
};

export default ProductFeatures;