'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function RecipeReviews({ mealId }) {
  const { user } = useUser(); // Clerk auth
  const userId = user?.id;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);

  const router = useRouter();

    useEffect(() => {
    const fetchReviews = async () => {
        try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_BASE}/api/reviews/${mealId}`);
        setReviews(res.data || []);
        if (userId) {
            const existing = res.data.find((r) => r.userId === userId);
            if (existing) {
            setUserReview(existing);
            setRating(existing.rating);
            setComment(existing.comment);
            }
        }
        } catch (err) {
        console.error("Error fetching reviews:", err);
        toast.error('Failed to load reviews');
        } finally {
        setLoading(false);
        }
    };

    if (mealId) fetchReviews();
    }, [mealId, userId]);

    const handleSubmit = async () => {
    try {
        if (!rating || !comment.trim()) {
        return toast.error('Please provide a rating and comment');
        }

        const payload = {
        userId: user.id,
        userName:  user.username,
        rating,
        comment,
        };

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const url = `${API_BASE}/api/reviews/${mealId}`;
        const method = userReview ? 'put' : 'post';

        await axios[method](url, payload);
        toast.success(userReview ? 'Review updated!' : 'Review submitted!');
        setUserReview({ ...payload });

        // Trigger the page to refresh
        window.location.reload();
    } catch (err) {
        console.error(err);
        toast.error('Error saving review');
    }
    };

    const handleDelete = async (reviewId) => {
    try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Only one delete request is needed
        await axios.delete(`${API_BASE}/api/reviews/${mealId}/${reviewId}`, {
        data: { userId: user.id }
        });

        toast.success('Review deleted!');
        
        // Update the reviews state by removing the deleted review
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));

        // Trigger the page to refresh
        window.location.reload();
    } catch (err) {
        console.error(err);
        toast.error('Error deleting review');
    }
    };


  return (
    <div className="mt-12 no-print">
      <h2 className="text-2xl font-semibold mb-4 text-[#D00000]">⭐ Reviews & Ratings</h2>

      {/* Average Rating */}
      {!loading && reviews.length > 0 && (
        <div className="mb-6 text-gray-800">
          Average Rating:{' '}
          <span className="text-[#D00000] font-semibold">
            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5
          </span>{' '}
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </div>
      )}

      {/* Logged-in User Form */}
      {user ? (
        <div className="mb-8 border rounded-lg p-4 shadow-sm bg-white">
          <h3 className="font-semibold mb-2">{userReview ? 'Edit Your Review' : 'Leave a Review'}</h3>

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar
                key={i}
                size={22}
                className={`cursor-pointer ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={() => setRating(i)}
              />
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded mb-2 text-sm"
            placeholder="Write your thoughts here..."
          />

          <button
            onClick={handleSubmit}
            className="bg-[#D00000] text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            {userReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-6">You must be logged in to leave a review.</p>
      )}

      {/* Existing Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 && !loading ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} className="border p-4 rounded-md bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    size={16}
                    className={i < r.rating ? 'text-yellow-500' : 'text-gray-300'}
                  />
                ))}
                {r.userId === userId && (
                  <div className="flex gap-2 ml-auto">
                    <FaTrash
                    size={18}
                    className="cursor-pointer text-red-500"
                    onClick={() => {
                        if (!r._id) return toast.error('Review ID missing');
                        handleDelete(r._id);
                    }}
                    />

                  </div>
                )}
              </div>
              <p className="text-sm mb-1 text-gray-700">{r.comment}</p>
              <p className="text-xs text-gray-500">
                — {r.userId === userId ? 'You' : r.userName || 'Anonymous'} •{' '}
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
