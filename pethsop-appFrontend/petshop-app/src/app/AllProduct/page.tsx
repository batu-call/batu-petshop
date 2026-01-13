import { Suspense } from "react";
import AllProduct from "./allProduct";


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllProduct />
    </Suspense>
  );
}