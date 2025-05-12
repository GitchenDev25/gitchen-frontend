import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { FaStar, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user?.id]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reviews/user/${user.id}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching your reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r._id} className="border p-4 rounded-md bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={16}
                className={i < r.rating ? 'text-yellow-500' : 'text-gray-300'}
              />
            ))}
            <div className="flex gap-2 ml-auto">
              <Link href={`/recipes/${r.mealId}`}>
                <button className="text-blue-600 text-sm underline">View Recipe Review</button>
              </Link>
            </div>
          </div>
          <p className="text-sm mb-1 text-gray-700">{r.comment}</p>
          <p className="text-xs text-gray-500">
            {new Date(r.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
