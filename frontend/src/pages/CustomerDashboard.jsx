
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRestaurants = async () => {
    try {
      const params = {};

      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (cuisine.trim()) params.cuisine = cuisine.trim();

      const response = await api.get("/restaurants", { params });

      setRestaurants(response.data.restaurants || []);
    } catch {
      setError("Unable to load restaurants.");
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await api.get("/reviews/my-reviews");

      setReviews(response.data.reviews || []);
    } catch {
      setError("Unable to load your reviews.");
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      const [restaurantResult, reviewResult] =
        await Promise.allSettled([
          api.get("/restaurants"),
          api.get("/reviews/my-reviews")
        ]);

      if (!isActive) return;

      if (restaurantResult.status === "fulfilled") {
        setRestaurants(
          restaurantResult.value.data.restaurants || []
        );
      } else {
        setError("Unable to load restaurants.");
      }

      if (reviewResult.status === "fulfilled") {
        setReviews(
          reviewResult.value.data.reviews || []
        );
      } else {
        setError((previous) =>
          previous
            ? `${previous} Unable to load your reviews.`
            : "Unable to load your reviews."
        );
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const getMyRestaurantReview = (restaurantId) => {
    return reviews.find((review) => {
      const reviewRestaurantId =
        review.restaurant?._id || review.restaurant;

      return (
        reviewRestaurantId?.toString() ===
        restaurantId.toString()
      );
    });
  };

  const renderStars = (value) => {
    if (value === null || value === undefined) {
      return "☆☆☆☆☆";
    }

    const filledStars = Math.max(
      0,
      Math.min(5, Math.round(Number(value)))
    );

    return (
      "★".repeat(filledStars) +
      "☆".repeat(5 - filledStars)
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    fetchRestaurants();
  };

  const submitReview = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedRestaurant) {
      setError("Please select a restaurant.");
      return;
    }

    if (reviewText.trim().length < 3) {
      setError("Review must contain at least 3 characters.");
      return;
    }

    try {
      await api.post("/reviews", {
        restaurantId: selectedRestaurant,
        rating: Number(rating),
        reviewText: reviewText.trim()
      });

      setMessage("Review submitted successfully!");
      setSelectedRestaurant("");
      setRating(5);
      setReviewText("");

      await fetchMyReviews();
      await fetchRestaurants();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit review."
      );
    }
  };

  const updateReview = async (review) => {
    const newRating = window.prompt(
      "Enter new rating (1 to 5):",
      review.rating
    );

    if (newRating === null) return;

    const ratingValue = Number(newRating);

    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      setError("Rating must be a whole number from 1 to 5.");
      return;
    }

    const newText = window.prompt(
      "Enter updated review:",
      review.reviewText
    );

    if (newText === null) return;

    if (newText.trim().length < 3) {
      setError("Review must contain at least 3 characters.");
      return;
    }

    try {
      await api.put(`/reviews/${review._id}`, {
        rating: ratingValue,
        reviewText: newText.trim()
      });

      setMessage("Review updated successfully!");
      setError("");

      await fetchMyReviews();
      await fetchRestaurants();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update review."
      );
    }
  };

  const deleteReview = async (reviewId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this review?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);

      setMessage("Review deleted successfully!");
      setError("");

      await fetchMyReviews();
      await fetchRestaurants();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete review."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Smart Winnr</h1>
          <p>Customer Dashboard</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      <h2 className="section-title">Browse Restaurants</h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search restaurant name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filter by cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => {
          const myReview = getMyRestaurantReview(
            restaurant._id
          );

          return (
            <div
              className="restaurant-card"
              key={restaurant._id}
            >
              <h3>{restaurant.name}</h3>

              <p>{restaurant.cuisine}</p>
              <p>{restaurant.location}</p>
              <p>{restaurant.address}</p>

              <div className="restaurant-rating">
                {restaurant.averageRating !== null &&
                restaurant.averageRating !== undefined ? (
                  <>
                    <span className="rating-stars">
                      {renderStars(restaurant.averageRating)}
                    </span>

                    <strong>
                      {Number(
                        restaurant.averageRating
                      ).toFixed(1)} / 5
                    </strong>
                  </>
                ) : (
                  <span>No ratings yet</span>
                )}
              </div>

              <p className="review-count">
                {restaurant.totalReviews || 0}{" "}
                {restaurant.totalReviews === 1
                  ? "Review"
                  : "Reviews"}
              </p>

              {myReview ? (
                <p className="customer-rating">
                  Your rating: {renderStars(myReview.rating)} (
                  {myReview.rating}/5)
                </p>
              ) : (
                <p className="customer-rating">
                  You haven't rated this restaurant yet.
                </p>
              )}

              <button
                onClick={() =>
                  setSelectedRestaurant(restaurant._id)
                }
              >
                {myReview
                  ? "Review Submitted"
                  : "Write a Review"}
              </button>
            </div>
          );
        })}

        {restaurants.length === 0 && (
          <p>No restaurants found.</p>
        )}
      </div>

      <h2 className="section-title">Submit Your Review</h2>

      <form className="review-form" onSubmit={submitReview}>
        <label>Select Restaurant</label>

        <select
          value={selectedRestaurant}
          onChange={(e) =>
            setSelectedRestaurant(e.target.value)
          }
          required
        >
          <option value="">Choose a restaurant</option>

          {restaurants.map((restaurant) => (
            <option
              key={restaurant._id}
              value={restaurant._id}
            >
              {restaurant.name}
            </option>
          ))}
        </select>

        <label>Rating</label>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} Star{value > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <label>Review</label>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your experience..."
          minLength={3}
          maxLength={1000}
          required
        />

        <button type="submit">Submit Review</button>
      </form>

      <h2 className="section-title">My Reviews</h2>

      <div className="my-reviews">
        {reviews.map((review) => (
          <div className="review-card" key={review._id}>
            <h3>
              {review.restaurant?.name || "Restaurant"}
            </h3>

            <p>
              Rating: {renderStars(review.rating)} (
              {review.rating} / 5)
            </p>

            <p>{review.reviewText}</p>

            <button onClick={() => updateReview(review)}>
              Edit
            </button>

            <button
              className="delete-button"
              onClick={() => deleteReview(review._id)}
            >
              Delete
            </button>
          </div>
        ))}

        {reviews.length === 0 && (
          <p>You have not submitted any reviews yet.</p>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
