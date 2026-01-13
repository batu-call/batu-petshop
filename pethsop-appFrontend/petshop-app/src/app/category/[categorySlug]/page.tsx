import { Suspense } from "react";
import CategoryPage from "./CategoryPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10">Loading category...</div>}>
      <CategoryPage />
    </Suspense>
  );
}