"use client";
import React from "react";
import Image from "next/image";
import {
  Star,
  RateReview,
  Send,
  ThumbUp,
  VerifiedUser,
  StarBorder,
  Delete,
} from "@mui/icons-material";
import { StarHalf } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from "axios";
import toast from "react-hot-toast";

const REVIEWS_PER_PAGE = 5;

type Reviews = {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  } | null;
  helpful: string[];
  rating: number;
  comment: string;
  createdAt: string;
};

interface ProductReviewsProps {
  reviews: Reviews[];
  comment: string;
  setComment: (value: string) => void;
  rating: number;
  setRating: (value: number) => void;
  onSubmitReview: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteReview: (id: string) => void;
  onHelpful: (id: string) => void;
  loading: boolean;
  userId?: string;
  avgRating: number;
  formatDate: (dateString: string) => string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews,
  comment,
  setComment,
  rating,
  setRating,
  onSubmitReview,
  onDeleteReview,
  onHelpful,
  loading,
  userId,
  avgRating,
  formatDate,
}) => {
  const router = useRouter();
  const [sortBy, setSortBy] = React.useState<"newest" | "helpful">("helpful");
  const [page, setPage] = React.useState(1);

  const sortedReviews = React.useMemo(() => {
    const reviewsCopy = [...reviews];
    if (sortBy === "newest") {
      return reviewsCopy.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateB - dateA;
      });
    } else {
      return reviewsCopy.sort(
        (a, b) => (b.helpful?.length || 0) - (a.helpful?.length || 0)
      );
    }
  }, [reviews, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE));

  const paginatedReviews = React.useMemo(() => {
    const start = (page - 1) * REVIEWS_PER_PAGE;
    return sortedReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [sortedReviews, page]);

  const { pageNumbers, paginationStart, paginationEnd } = React.useMemo(() => {
    const visibleCount = 5;
    let start = Math.max(2, page - Math.floor(visibleCount / 2));
    let end = start + visibleCount - 1;
    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(2, end - visibleCount + 1);
    }
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return { pageNumbers: nums, paginationStart: start, paginationEnd: end };
  }, [page, totalPages]);

  React.useEffect(() => { setPage(1); }, [sortBy]);

const goToPage = (p: number) => {
  setPage(p);
  const el = document.getElementById("reviews-section");
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

  const handleSubmitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) { router.push("/Login"); return; }
    onSubmitReview(e);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!userId) { router.push("/Login"); return; }
    try {
      await onHelpful(reviewId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error("Please wait a moment before trying again.");
      }
    }
  };

  return (
    <main className="px-4 pb-24 pt-2 max-w-[800px] mx-auto font-sans bg-gray-50 dark:bg-[#0d1f18]">

      <h2 className="text-color2 dark:text-[#0E5F44]! text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 dark:border-[#2d5a3d] mb-6">
        Product Reviews
      </h2>

      {/* Summary */}
      <div className="flex items-center gap-6 mb-8 bg-white dark:bg-[#162820] px-6 py-5 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2d5a3d]">
        <div className="flex flex-col items-center min-w-[64px]">
          <span className="text-5xl font-black text-gray-900 dark:text-[#c8e6d0] leading-none">
            {reviews.length
              ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
              : "0.0"}
          </span>
          <span className="text-xs text-gray-400 dark:text-[#7aab8a] mt-1 font-medium">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="h-14 w-px bg-gray-200 dark:bg-[#2d5a3d]" />

        <div className="flex flex-col gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => {
              if (avgRating >= i) return <Star key={i} sx={{ fontSize: 20 }} className="text-yellow-400" />;
              if (avgRating >= i - 0.5) return <StarHalf key={i} size={16} className="text-yellow-400" />;
              return <StarBorder key={i} sx={{ fontSize: 20 }} className="text-gray-300 dark:text-white/20" />;
            })}
          </div>
          <span className="text-sm text-gray-500 dark:text-[#7aab8a] font-medium flex items-center gap-1.5">
            <VerifiedUser sx={{ fontSize: 16 }} className="text-green-500" />
            Our customers recommend
          </span>
        </div>
      </div>

      {/* Write a Review */}
      <section className="mb-10">
        <h3 className="text-lg font-bold text-color dark:text-[#c8e6d0] mb-4 flex items-center gap-2">
          <RateReview sx={{ fontSize: 22 }} className="text-color2 dark:text-[#7aab8a]" />
          Write a Review
        </h3>

        <form
          onSubmit={handleSubmitReview}
          className="bg-white dark:bg-[#162820] rounded-2xl shadow-md p-6 border border-gray-100 dark:border-[#2d5a3d] flex flex-col gap-5"
        >
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-[#7aab8a]">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i)}
                  className={`transition-transform cursor-pointer hover:scale-125 ${
                    rating >= i ? "text-yellow-400" : "text-gray-300 dark:text-white/20"
                  }`}
                >
                  <Star sx={{ fontSize: 36 }} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            placeholder="Share your experience with this product..."
            className="w-full bg-gray-50 dark:bg-[#0d1f18] dark:text-[#c8e6d0] dark:placeholder-[#7aab8a] border border-[#97cba9] dark:border-[#2d5a3d] rounded-xl p-4 text-base focus:ring-2 focus:ring-[#97cba9] dark:focus:ring-[#2d5a3d] focus:bg-[#D6EED6]/40 dark:focus:bg-[#1a3d2a] outline-none resize-none transition-all"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary dark:bg-[#0b8457] hover:bg-[#D6EED6] dark:hover:bg-[#2d5a3d] cursor-pointer text-[#393E46] dark:text-[#c8e6d0] font-bold py-3.5 rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Review"}
            <Send sx={{ fontSize: 18 }} />
          </button>
        </form>
      </section>

      {/* Reviews List */}
      <section id="reviews-section">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-color dark:text-[#c8e6d0]">
            {reviews.length > 0
              ? `${reviews.length} ${reviews.length === 1 ? "Review" : "Reviews"}`
              : "Reviews"}
          </h3>
          {reviews.length > 1 && (
            <button
              onClick={() => setSortBy(sortBy === "newest" ? "helpful" : "newest")}
              className="text-xs text-color2 dark:text-[#7aab8a] font-semibold cursor-pointer hover:text-[#97cba9] dark:hover:text-[#c8e6d0] transition-colors border border-[#97cba9] dark:border-[#2d5a3d] px-3 py-1.5 rounded-full"
            >
              {sortBy === "newest" ? "Most Helpful ↑" : "Newest ↑"}
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#162820] rounded-2xl border border-gray-100 dark:border-[#2d5a3d]">
            <RateReview sx={{ fontSize: 52 }} className="text-gray-200 dark:text-[#2d5a3d] mb-3" />
            <p className="text-base font-semibold text-gray-400 dark:text-[#7aab8a]">No reviews yet</p>
            <p className="text-sm text-gray-400 dark:text-[#7aab8a]/70 mt-1">
              Be the first to share your experience 🐾
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => {
 
                const reviewUserId = review.userId?._id ?? null;
                const isOwner = !!userId && !!reviewUserId && userId === reviewUserId;
                const isHelpful = review.helpful.includes(userId ?? "");

                return (
                  <div
                    key={review._id}
                    className="bg-white dark:bg-[#162820] rounded-2xl shadow-sm border border-gray-100 dark:border-[#2d5a3d] overflow-hidden"
                  >
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-[#97cba9] dark:border-[#2d5a3d] flex-shrink-0">

                            {review.userId?.avatar ? (
                              <Image
                                src={review.userId.avatar}
                                alt={`${review.userId.firstName ?? "User"} avatar`}
                                fill
                                sizes="44px"
                                className="object-cover object-center"
                                quality={90}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-[#2d5a3d] dark:to-[#1a3d2a] flex items-center justify-center">
                                <span className="text-gray-500 dark:text-[#7aab8a] font-black text-sm">?</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-color dark:text-[#c8e6d0] truncate">
                            
                              {review.userId
                                ? `${review.userId.firstName || "User"} ${review.userId.lastName?.[0] ?? ""}.`
                                : "Deleted User"}
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-[#7aab8a] mt-0.5">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              sx={{ fontSize: 15 }}
                              className={
                                i < review.rating
                                  ? "text-yellow-400"
                                  : "text-gray-200 dark:text-white/10"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="mt-4 text-gray-600 dark:text-[#a8d4b8] text-sm leading-relaxed break-words">
                        {review.comment}
                      </p>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-[#0d1f18]/60 border-t border-gray-100 dark:border-[#2d5a3d]">
                      <button
                        onClick={() => handleHelpful(review._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 ${
                          isHelpful
                            ? "bg-[#97cba9]/20 dark:bg-[#0b8457]/30 border-[#97cba9] dark:border-[#7aab8a] text-[#3a7a56] dark:text-[#7aab8a]"
                            : "bg-transparent border-gray-200 dark:border-[#2d5a3d] text-gray-400 dark:text-[#7aab8a]/50 hover:border-[#97cba9] dark:hover:border-[#7aab8a] hover:text-[#3a7a56] dark:hover:text-[#7aab8a]"
                        }`}
                      >
                        <ThumbUp sx={{ fontSize: 13 }} />
                        Helpful
                        {review.helpful?.length > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isHelpful
                              ? "bg-[#97cba9]/30 dark:bg-[#0b8457]/40 text-[#3a7a56] dark:text-[#7aab8a]"
                              : "bg-gray-100 dark:bg-[#2d5a3d] text-gray-500 dark:text-[#7aab8a]"
                          }`}>
                            {review.helpful.length}
                          </span>
                        )}
                      </button>

                      {isOwner && (
                        <button
                          onClick={() => onDeleteReview(review._id)}
                          className="flex items-center gap-1 text-xs text-gray-300 dark:text-[#7aab8a]/40 hover:text-red-400 dark:hover:text-red-400 font-medium cursor-pointer transition-all duration-200 active:scale-95 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Delete sx={{ fontSize: 14 }} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8 text-color dark:text-[#a8d4b8]">
                <PaginationContent>
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious
                      onClick={() => page > 1 && goToPage(page - 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === 1 ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>

                  <PaginationItem className="cursor-pointer">
                    <PaginationLink
                      isActive={page === 1}
                      onClick={() => goToPage(1)}
                      className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>

                  {paginationStart > 2 && (
                    <PaginationItem>
                      <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
                    </PaginationItem>
                  )}

                  {pageNumbers.map((p) => (
                    <PaginationItem key={p} className="cursor-pointer">
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => goToPage(p)}
                        className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {paginationEnd < totalPages - 1 && (
                    <PaginationItem>
                      <span className="px-2 text-sm text-gray-400 dark:text-[#7aab8a]">…</span>
                    </PaginationItem>
                  )}

                  {totalPages > 1 && (
                    <PaginationItem className="cursor-pointer">
                      <PaginationLink
                        isActive={page === totalPages}
                        onClick={() => goToPage(totalPages)}
                        className="dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:aria-[current]:bg-[#0b8457] dark:aria-[current]:text-white dark:border-white/10"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem className="cursor-pointer">
                    <PaginationNext
                      onClick={() => page < totalPages && goToPage(page + 1)}
                      className={`dark:text-[#a8d4b8] dark:hover:bg-[#1e3d2a] dark:hover:text-[#c8e6d0] dark:border-white/10 ${page === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default ProductReviews;