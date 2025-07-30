import { useState } from "react";
import { useFeedback } from "../../hooks/useFeedback";

export default function Review() {
  const {
    feedback,
    loading,
    error,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
  } = useFeedback();

  // State for new feedback form
  const [revieweeId, setRevieweeId] = useState("");
  const [comment, setComment] = useState("");
  const [ratingScore, setRatingScore] = useState(5);
  const [assignmentId, setAssignmentId] = useState("");

  // State for editing feedback
  const [editId, setEditId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback({
      review_type: "CLIENT_TO_EMPLOYEE",
      created_at: new Date().toISOString(),
      assignment_id: assignmentId,
      reviewee_id: revieweeId,
      comment,
      rating_score: ratingScore,
    });
    setRevieweeId("");
    setComment("");
    setRatingScore(5);
  };

  const handleEdit = (fb: any) => {
    setEditId(fb.feedback_id);
    setEditComment(fb.content);
    setEditRating(fb.rating);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateFeedback(editId, {
        comment: editComment,
        rating_score: editRating,
      });
      setEditId(null);
      setEditComment("");
      setEditRating(5);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFeedback(id);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Feedback Review Test</h1>
      {typeof error === "string" && (
        <div className="text-red-500 mb-2">{error}</div>
      )}
      {loading && <div>Loading...</div>}

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          className="border p-2 rounded w-64"
          placeholder="Reviewee ID"
          value={revieweeId}
          onChange={(e) => setRevieweeId(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-64"
          placeholder="Feedback content"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-64"
          placeholder="Assignment ID"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded w-24"
          type="number"
          min={1}
          max={5}
          value={ratingScore}
          onChange={(e) => setRatingScore(Number(e.target.value))}
          required
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          type="submit"
        >
          Submit Feedback
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Feedback List</h2>
      <ul>
        {(feedback ?? []).map((fb) => (
          <li key={String(fb.feedback_id)} className="mb-4 border-b pb-2">
            {editId === fb.feedback_id ? (
              <form onSubmit={handleUpdate} className="space-x-2">
                <input
                  className="border p-1 rounded"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  required
                />
                <input
                  className="border p-1 rounded w-16"
                  type="number"
                  min={1}
                  max={5}
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  required
                />
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  type="submit"
                >
                  Save
                </button>
                <button
                  className="bg-gray-300 px-2 py-1 rounded"
                  type="button"
                  onClick={() => setEditId(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div>
                <div>
                  <strong>Reviewee:</strong> {fb.reviewee_id}
                </div>
                <div>
                  <strong>Feedback id:</strong> {fb.feedback_id}
                </div>
                <div>
                  <strong>Content:</strong> {fb.comment}
                </div>
                <div>
                  <strong>Rating:</strong> {fb.rating_score}
                </div>
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleEdit(fb)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(fb.feedback_id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
