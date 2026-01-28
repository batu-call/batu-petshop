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
} from "@mui/icons-material";
import { StarHalf } from "lucide-react";

type Reviews = {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
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
  return (
    <main className="px-4 pb-24 pt-2 max-w-lg mx-auto font-sans bg-gray-50 min-h-dvh">
      <h2 className="text-color2 text-3xl md:text-4xl font-bold flex items-center w-full justify-center py-4 text-jost border-b-2 border-color2 mb-6">
        Product Reviews
      </h2>

      {/* SUMMARY */}
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-2">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="block text-4xl font-bold text-gray-900">
              {reviews.length
                ? (
                    reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
                  ).toFixed(1)
                : "0.0"}
            </span>
            <span className="text-xs text-gray-500">
              {reviews.length} Review
            </span>
          </div>

          <div className="h-12 w-px bg-gray-200"></div>

          <div className="flex flex-col">
            <div className="flex text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => {
                if (avgRating >= i) {
                  return <Star key={i} fontSize="small" />;
                }

                if (avgRating >= i - 0.5 && avgRating < i) {
                  return <StarHalf key={i} fontSize="small" />;
                }

                return <StarBorder key={i} fontSize="small" />;
              })}
            </div>
            <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
              <VerifiedUser
                className="text-green-500 text-xs"
                sx={{ fontSize: 16 }}
              />
              Our customers recommend
            </span>
          </div>
        </div>
      </div>

      {/* ADD REVIEW */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-color mb-4 flex items-center gap-2">
          <RateReview className="text-color2" />
          Write a Review
        </h2>

        <form
          onSubmit={onSubmitReview}
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        >
          <div className="flex flex-col items-center mb-6">
            <label className="text-sm font-medium text-gray-500">
              Your Rating
            </label>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i)}
                  className={`transition-transform cursor-pointer ${
                    rating >= i ? "text-yellow-500" : "text-gray-300"
                  } hover:scale-125`}
                >
                  <Star sx={{ fontSize: 32 }} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            placeholder="Write your review..."
            className="w-full bg-gray-50 border border-[#97cba9] rounded-xl p-4 text-sm focus:ring-2 focus:bg-[#D6EED6] outline-none resize-none mb-4 max-h-40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#D6EED6] cursor-pointer text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Submitting..." : "Submit Review"}
            <Send sx={{ fontSize: 18 }} />
          </button>
        </form>
      </section>

      {/* REVIEWS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-color">Latest Reviews</h2>
          <span className="text-xs text-color2 font-semibold cursor-pointer">
            Newest
          </span>
        </div>

        <div className="space-y-4 max-h-150 overflow-y-auto pr-2">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative"
            >
              <div className="absolute bottom-5 right-10 cursor-pointer">
                {userId === review.userId?._id && (
                  <button
                    onClick={() => onDeleteReview(review._id)}
                    className="text-xs text-color2 hover:text-[#D6EED6] font-medium cursor-pointer mb-1 transition duration-300 ease-in-out active:scale-[0.97]"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-gray-300">
                    <Image
                      src={review.userId?.avatar || "/default-avatar.png"}
                      alt="user avatar"
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-color">
                      {review.userId?.firstName || "User"}{" "}
                      {review.userId?.lastName?.[0]}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {formatDate(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex text-yellow-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} sx={{ fontSize: 16 }} />
                  ))}
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap overflow-hidden">
                {review.comment}
              </p>

              <div className="mt-4">
                <button
                  onClick={() => onHelpful(review._id)}
                  className={`text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer duration-300 ease-in-out hover:scale-102 active:scale-[0.97]
                    ${
                      review.helpful.includes(userId ?? "")
                        ? "text-color2"
                        : "text-gray-400 hover:text-[#97cba9]"
                    }`}
                >
                  <ThumbUp sx={{ fontSize: 14 }} />
                  Helpful ({review.helpful?.length ?? 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductReviews;