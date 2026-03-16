"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { ThumbUp, DeleteSweep } from "@mui/icons-material";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  onBulkDeleteReviews: (ids: string[]) => void;
  formatDate: (dateString: string) => string;
}

const REVIEWS_PER_PAGE = 5;

const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "??";
};

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onDeleteReview,
  onBulkDeleteReviews,
  formatDate,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const isSelectionMode = selectedIds.length > 0;

  const totalPages = Math.ceil((reviews?.length ?? 0) / REVIEWS_PER_PAGE);
  const paginatedReviews = reviews?.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = () => {
    onBulkDeleteReviews(selectedIds);
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const handleSingleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    onDeleteReview(id);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reviews.map((r) => r._id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h2 className="text-color dark:text-[#7aab8a]! text-3xl md:text-4xl font-bold flex items-center justify-center py-4 border-b-2 border-color2 dark:border-border mb-8">
        Product Reviews
      </h2>

      {reviews && reviews.length > 0 && (
        <div className="flex items-center justify-between mb-4 bg-white dark:bg-card rounded-xl p-3 shadow-sm dark:shadow-none border border-gray-100 dark:border-border">
          <label
            className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-muted-foreground font-medium select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={reviews.length > 0 && selectedIds.length === reviews.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#5a9677] cursor-pointer"
            />
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select All"}
          </label>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-accent text-gray-700 dark:text-foreground border border-gray-300 dark:border-border rounded-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-sm hover:shadow-md font-medium cursor-pointer"
            >
              <DeleteSweep fontSize="small" />
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      )}

      {!reviews || reviews.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-muted-foreground">No reviews yet.</p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedReviews.map((review) => {
              const reviewUser = review.userId;
              const isSelected = selectedIds.includes(review._id);

              return (
                <div
                  key={review._id}
                  onClick={() => toggleSelect(review._id)}
                  className={`group bg-white dark:bg-card rounded-2xl p-5 shadow-sm dark:shadow-none border relative cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[#5a9677] dark:border-primary bg-[#f0faf4] dark:bg-primary/10 shadow-md"
                      : "border-gray-100 dark:border-border hover:border-gray-200 dark:hover:border-border/80"
                  }`}
                >
                  {!isSelectionMode && (
                    <button
                      onClick={(e) => handleSingleDelete(e, review._id)}
                      className="absolute top-2 right-2 text-color dark:text-foreground cursor-pointer opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:text-red-400 dark:hover:text-red-400"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(review._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-[#5a9677] cursor-pointer flex-shrink-0"
                      />

                      {reviewUser ? (
                        <Link
                          href={`/userDetails/${reviewUser._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border dark:border-border flex-shrink-0">
                            {reviewUser.avatar ? (
                              <Image
                                src={reviewUser.avatar}
                                alt="user avatar"
                                fill
                                sizes="(min-width: 768px) 48px, 40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#97cba9] to-[#7ab89a] flex items-center justify-center">
                                <span className="text-white font-black text-xs">
                                  {getInitials(reviewUser.firstName, reviewUser.lastName)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-color dark:text-[#7aab8a]! hover:text-color2 dark:hover:text-primary transition-colors">
                              {reviewUser.firstName} {reviewUser.lastName?.[0]}.
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border dark:border-border flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-accent dark:to-muted flex items-center justify-center">
                              <span className="text-gray-500 dark:text-muted-foreground font-black text-xs">?</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-gray-400 dark:text-muted-foreground">
                              Deleted User
                            </h3>
                            <p className="text-[11px] text-gray-400 dark:text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex text-yellow-500 mr-6">
                      {[...Array(review.rating)].map((_, i) => (
                        <StarOutlineIcon key={i} fontSize="small" />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-wrap pl-7">
                    {review.comment}
                  </p>

                  <div className="mt-4 pl-7">
                    <span className="text-gray-400 dark:text-muted-foreground text-xs flex items-center gap-1 font-medium">
                      <ThumbUp sx={{ fontSize: 14 }} />
                      Helpful ({review.helpful?.length ?? 0})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-card text-gray-600 dark:text-foreground hover:border-[#97cba9] dark:hover:border-primary hover:text-[#5a9677] dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                    currentPage === page
                      ? "bg-[#5a9677] dark:bg-primary text-white dark:text-primary-foreground border-[#5a9677] dark:border-primary shadow-sm"
                      : "bg-white dark:bg-card text-gray-600 dark:text-foreground border-gray-200 dark:border-border hover:border-[#97cba9] dark:hover:border-primary hover:text-[#5a9677] dark:hover:text-primary"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-card text-gray-600 dark:text-foreground hover:border-[#97cba9] dark:hover:border-primary hover:text-[#5a9677] dark:hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 dark:text-muted-foreground mt-3">
            {reviews.length} reviews · Page {currentPage} of {totalPages}
          </p>
        </>
      )}
    </div>
  );
};

export default ReviewList;