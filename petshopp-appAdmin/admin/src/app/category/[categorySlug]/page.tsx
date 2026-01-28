import { Suspense } from "react";
import CategoryPage from "./CategoryPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CategoryPage />
    </Suspense>
  );
}