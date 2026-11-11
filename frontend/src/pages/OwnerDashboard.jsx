
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "",
    location: "",
    address: "",
    phone: "",
    email: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      const [restaurantResult, reviewsResult] =
        await Promise.allSettled([
          api.get("/restaurants/owner/my-restaurant"),
          api.get("/restaurants/owner/my-reviews")
        ]);

      if (!isActive) return;

      if (restaurantResult.status === "fulfilled") {
        const data = restaurantResult.value.data.restaurant;

        setRestaurant(data);

        setFormData({
          name: data.name || "",
          description: data.description || "",
          cuisine: data.cuisine || "",
          location: data.location || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || ""
        });
      } else {
        setError("Unable to load assigned restaurant.");
      }

      if (reviewsResult.status === "fulfilled") {
        const data = reviewsResult.value.data;

        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } else {
        setError((previous) =>
          previous
            ? `${previous} Unable to load restaurant reviews.`
            : "Unable to load restaurant reviews."
        );
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const updateRestaurant = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await api.put(
        `/restaurants/${restaurant._id}`,
        formData
      );

      setRestaurant(response.data.restaurant);
      setMessage("Restaurant details updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update restaurant."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!restaurant && !error) {
    return <h2>Loading Owner Dashboard...</h2>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Smart Winnr</h1>
          <p>Restaurant Owner Dashboard</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {restaurant && (
        <>
          <h2 className="section-title">
            Restaurant Overview
          </h2>

          <div className="stats-grid owner-stats">
            <div className="stat-card">
              <h3>Restaurant</h3>
              <h2>{restaurant.name}</h2>
            </div>

            <div className="stat-card">
              <h3>Average Rating</h3>
              <h1>{averageRating} / 5</h1>
            </div>

            <div className="stat-card">
              <h3>Total Reviews</h3>
              <h1>{totalReviews}</h1>
            </div>
          </div>

          <h2 className="section-title">
            Update Restaurant Details
          </h2>

          <form
            className="owner-form"
            onSubmit={updateRestaurant}
          >
            <label>Restaurant Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <label>Cuisine</label>
            <input
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              required
            />

            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <label>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <button type="submit">
              Save Changes
            </button>
          </form>

          <h2 className="section-title">
            Customer Reviews
          </h2>

          <div className="my-reviews">
            {reviews.map((review) => (
              <div
                className="review-card"
                key={review._id}
              >
                <h3>Customer Review</h3>

                <p>
                  Customer: {review.customer?.name || "Customer"}
                </p>

                <p>
                  Email: {review.customer?.email || "Not available"}
                </p>

                <p>Rating: {review.rating} / 5</p>

                <p>{review.reviewText}</p>
              </div>
            ))}

            {reviews.length === 0 && (
              <p>No customer reviews available yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default OwnerDashboard;
