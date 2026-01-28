"use client";
import React from "react";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { ThumbUp } from "@mui/icons-material";

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

interface ReviewListProps {
  reviews: Reviews[];
  onDeleteReview: (id: string) => void;
  formatDate: (dateString: string) => string;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onDeleteReview,
  formatDate,
}) => {
  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h2 className="text-color text-3xl md:text-4xl font-bold flex items-center justify-center py-4 border-b-2 border-color2 mb-8">
        Product Reviews
      </h2>

      {!reviews || reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const reviewUser = review.userId;

            return (
              <div
                key={review._id}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative"
              >
                <button
                  onClick={() => onDeleteReview(review._id)}
                  className="absolute top-2 right-2
text-color cursor-pointer
opacity-100 lg:opacity-0 lg:group-hover:opacity-100
transition-all duration-300 hover:scale-110"
                >
                  <CloseIcon fontSize="small" />
                </button>

                {/* HEADER */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                      <Image
                        src={
                          review.userId?.avatar || "/default-avatar.png"
                        }
                        alt="user avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-color">
                        {reviewUser
                          ? `${reviewUser.firstName} ${reviewUser.lastName?.[0]}.`
                          : "Deleted User"}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* RATING */}
                  <div className="flex text-yellow-500 mr-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <StarOutlineIcon key={i} fontSize="small" />
                    ))}
                  </div>
                </div>

                {/* COMMENT */}
                <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {review.comment}
                </p>

                <div className="mt-4">
                  <button
                    className={`text-gray-400 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer duration-300 ease-in-out hover:scale-102 active:scale-[0.97]`}
                  >
                    <ThumbUp sx={{ fontSize: 14 }} />
                    Helpful ({review.helpful?.length ?? 0})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewList;