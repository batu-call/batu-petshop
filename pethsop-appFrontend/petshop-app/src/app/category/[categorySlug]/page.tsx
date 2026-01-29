import { Suspense } from "react";
import CategoryPage from "./CategoryPage";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {

  const { categorySlug } = await params; 

  if (!categorySlug) {
    return {
      title: "Category | Batu Petshop",
      description: "Browse our product categories.",
    };
  }

  const categoryName = categorySlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return {
    title: `${categoryName} | Batu Petshop`,
    description: `Browse ${categoryName} products with great deals, fast delivery and best prices.`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CategoryPage />
    </Suspense>
  );
}
