
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [restaurantData, setRestaurantData] = useState({
    name: "",
    description: "",
    cuisine: "",
    location: "Gachibowli, Hyderabad",
    address: "",
    phone: "",
    email: ""
  });

  const [userSearch, setUserSearch] = useState("");
  const [selectedOwners, setSelectedOwners] = useState({});

  // Display star symbols
  const renderStars = (rating) => {
    const value = Math.max(
      0,
      Math.min(5, Math.round(Number(rating) || 0))
    );

    return "★".repeat(value) + "☆".repeat(5 - value);
  };

  // Initial dashboard data loading
  useEffect(() => {
    let isActive = true;

    const loadDashboardData = async () => {
      const results = await Promise.allSettled([
        api.get("/users/dashboard"),
        api.get("/users"),
        api.get("/restaurants"),
        api.get("/reviews/admin/all")
      ]);

      if (!isActive) return;

      const [dashboardResult, usersResult, restaurantsResult, reviewsResult] =
        results;

      const errors = [];

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value.data.dashboard);
      } else {
        errors.push("Unable to load dashboard");
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value.data.users || []);
      } else {
        errors.push("Unable to load users");
      }

      if (restaurantsResult.status === "fulfilled") {
        setRestaurants(
          restaurantsResult.value.data.restaurants || []
        );
      } else {
        errors.push("Unable to load restaurants");
      }

      if (reviewsResult.status === "fulfilled") {
        setReviews(reviewsResult.value.data.reviews || []);
      } else {
        errors.push("Unable to load reviews");
      }

      setError(errors.join(". "));
      setLoading(false);
    };

    loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  // Refresh dashboard statistics
  const fetchDashboard = async () => {
    try {
      const response = await api.get("/users/dashboard");
      setDashboard(response.data.dashboard);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh users
  const fetchUsers = async () => {
    setUsersLoading(true);

    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load users"
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // Refresh restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await api.get("/restaurants");
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load restaurants"
      );
    }
  };

  // Refresh reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const response = await api.get("/reviews/admin/all");
      setReviews(response.data.reviews || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load reviews"
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Owner form changes
  const handleOwnerChange = (e) => {
    setOwnerData({
      ...ownerData,
      [e.target.name]: e.target.value
    });
  };

  // Create restaurant owner
  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setOwnerLoading(true);

    try {
      const response = await api.post("/users/owner", ownerData);

      setSuccess(
        response.data.message ||
          "Restaurant owner created successfully!"
      );

      setOwnerData({
        name: "",
        email: "",
        password: ""
      });

      await fetchUsers();
      await fetchDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create owner"
      );
    } finally {
      setOwnerLoading(false);
    }
  };

  // Activate or deactivate user
  const handleUserStatus = async (user) => {
    setError("");
    setSuccess("");

    try {
      await api.put(`/users/${user._id}/status`, {
        isActive: !user.isActive
      });

      setSuccess(
        `${user.name}'s account has been ${
          user.isActive ? "deactivated" : "activated"
        }.`
      );

      await fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update user status"
      );
    }
  };

  // Restaurant form changes
  const handleRestaurantChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value
    });
  };

  // Create restaurant
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setRestaurantLoading(true);

    try {
      const response = await api.post(
        "/restaurants",
        restaurantData
      );

      setSuccess(
        response.data.message ||
          "Restaurant created successfully!"
      );

      setRestaurantData({
        name: "",
        description: "",
        cuisine: "",
        location: "Gachibowli, Hyderabad",
        address: "",
        phone: "",
        email: ""
      });

      await fetchRestaurants();
      await fetchDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create restaurant"
      );
    } finally {
      setRestaurantLoading(false);
    }
  };

  // Assign restaurant owner
  const handleAssignOwner = async (restaurantId) => {
    const ownerId = selectedOwners[restaurantId];

    if (!ownerId) {
      setError("Please select an owner before assigning.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/restaurants/${restaurantId}/owner`,
        { ownerId }
      );

      setSuccess(
        response.data.message ||
          "Restaurant owner assigned successfully!"
      );

      await fetchRestaurants();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to assign owner"
      );
    }
  };

  // Deactivate restaurant
  const handleDeactivateRestaurant = async (restaurant) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${restaurant.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await api.delete(
        `/restaurants/${restaurant._id}`
      );

      setSuccess(
        response.data.message ||
          "Restaurant deactivated successfully!"
      );

      await fetchRestaurants();
      await fetchDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to deactivate restaurant"
      );
    }
  };

  // Delete review
  const handleDeleteReview = async (review) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this review?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await api.delete(
        `/reviews/admin/${review._id}`
      );

      setSuccess(
        response.data.message ||
          "Review removed successfully!"
      );

      await fetchReviews();
      await fetchDashboard();
      await fetchRestaurants();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove review"
      );
    }
  };

  // Search users
  const filteredUsers = users.filter((user) => {
    const searchValue = userSearch.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue) ||
      user.role?.toLowerCase().includes(searchValue)
    );
  });

  // Active restaurant owners
  const activeOwners = users.filter(
    (user) => user.role === "owner" && user.isActive
  );

  // Rating distribution
  const ratingDistribution =
    dashboard?.ratingDistribution || {};

  const totalReviews = Number(
    dashboard?.totalReviews || 0
  );

  // Loading screen
  if (loading) {
    return (
      <div className="dashboard-container">
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  // Dashboard error screen
  if (!dashboard) {
    return (
      <div className="dashboard-container">
        <h2>{error || "Dashboard unavailable"}</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Smart Winnr</h1>
          <p>Administrator Dashboard</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      {error && <div className="admin-alert">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      {/* PLATFORM OVERVIEW */}
      <h2 className="section-title">Platform Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <h1>{dashboard.totalUsers}</h1>
        </div>

        <div className="stat-card">
          <h3>Total Restaurants</h3>
          <h1>{dashboard.totalRestaurants}</h1>
        </div>

        <div className="stat-card">
          <h3>Total Reviews</h3>
          <h1>{dashboard.totalReviews}</h1>
        </div>

        <div className="stat-card">
          <h3>Average Rating</h3>
          <h1>
            {totalReviews > 0
              ? `${Number(
                  dashboard.averageRating || 0
                ).toFixed(1)} / 5`
              : "No ratings yet"}
          </h1>

          {totalReviews > 0 && (
            <p className="rating-stars">
              {renderStars(dashboard.averageRating)}
            </p>
          )}
        </div>
      </div>

      {/* RATING DISTRIBUTION */}
      <div className="rating-section">
        <h2>Rating Distribution</h2>

        {[5, 4, 3, 2, 1].map((rating) => {
          const count = Number(
            ratingDistribution[rating] || 0
          );

          const percentage =
            totalReviews > 0
              ? (count / totalReviews) * 100
              : 0;

          return (
            <div className="rating-row" key={rating}>
              <span className="rating-stars">
                {renderStars(rating)}
              </span>

              <div className="rating-progress">
                <div className="rating-progress-track">
                  <div
                    className="rating-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <strong>
                {count} {count === 1 ? "Review" : "Reviews"}
              </strong>
            </div>
          );
        })}

        {totalReviews === 0 && (
          <p>No ratings have been submitted yet.</p>
        )}
      </div>

      {/* CREATE OWNER */}
      <section className="admin-section">
        <h2 className="section-title">
          Create Restaurant Owner
        </h2>

        <p className="admin-description">
          Create an account for a restaurant owner. You can
          assign their restaurant after creating the account.
        </p>

        <form
          className="admin-form"
          onSubmit={handleCreateOwner}
        >
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter owner name"
                value={ownerData.name}
                onChange={handleOwnerChange}
                minLength="2"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter owner email"
                value={ownerData.email}
                onChange={handleOwnerChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="8-16 characters"
                value={ownerData.password}
                onChange={handleOwnerChange}
                minLength="8"
                maxLength="16"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={ownerLoading}>
            {ownerLoading
              ? "Creating..."
              : "Create Owner Account"}
          </button>
        </form>
      </section>

      {/* USER MANAGEMENT */}
      <section className="admin-section">
        <h2 className="section-title">User Management</h2>

        <p className="admin-description">
          View registered customers and restaurant owners and
          manage their account status.
        </p>

        <input
          className="admin-search"
          type="text"
          placeholder="Search by name, email or role..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
        />

        {usersLoading ? (
          <p>Loading users...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="role-label">
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            user.isActive
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {user.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {user.role !== "admin" ? (
                          <button
                            className={
                              user.isActive
                                ? "deactivate-button"
                                : "activate-button"
                            }
                            onClick={() =>
                              handleUserStatus(user)
                            }
                          >
                            {user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        ) : (
                          <span>Administrator</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RESTAURANT MANAGEMENT */}
      <section className="admin-section">
        <h2 className="section-title">
          Restaurant Management
        </h2>

        <p className="admin-description">
          Add restaurants to Smart Winnr and assign registered
          restaurant owners.
        </p>

        <h3 className="admin-subtitle">
          Add New Restaurant
        </h3>

        <form
          className="admin-form"
          onSubmit={handleCreateRestaurant}
        >
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter restaurant name"
                value={restaurantData.name}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Cuisine</label>
              <input
                type="text"
                name="cuisine"
                placeholder="Example: Indian, Italian"
                value={restaurantData.cuisine}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={restaurantData.location}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter restaurant address"
                value={restaurantData.address}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={restaurantData.phone}
                onChange={handleRestaurantChange}
              />
            </div>

            <div className="form-group">
              <label>Restaurant Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter restaurant email"
                value={restaurantData.email}
                onChange={handleRestaurantChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the restaurant"
              value={restaurantData.description}
              onChange={handleRestaurantChange}
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={restaurantLoading}
          >
            {restaurantLoading
              ? "Adding Restaurant..."
              : "Add Restaurant"}
          </button>
        </form>

        <h3 className="admin-subtitle">
          All Restaurants
        </h3>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Cuisine</th>
                <th>Location</th>
                <th>Assigned Owner</th>
                <th>Assign Owner</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td>{restaurant.name}</td>
                    <td>{restaurant.cuisine}</td>
                    <td>{restaurant.location}</td>
                    <td>
                      {restaurant.owner?.name || "Not assigned"}
                    </td>

                    <td>
                      <select
                        value={
                          selectedOwners[restaurant._id] || ""
                        }
                        onChange={(e) =>
                          setSelectedOwners({
                            ...selectedOwners,
                            [restaurant._id]: e.target.value
                          })
                        }
                      >
                        <option value="">Select owner</option>

                        {activeOwners.map((owner) => (
                          <option
                            key={owner._id}
                            value={owner._id}
                          >
                            {owner.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleAssignOwner(restaurant._id)
                        }
                        disabled={!restaurant.isActive}
                      >
                        Assign
                      </button>
                    </td>

                    <td>
                      <span
                        className={
                          restaurant.isActive
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {restaurant.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {restaurant.isActive ? (
                        <button
                          className="deactivate-button"
                          onClick={() =>
                            handleDeactivateRestaurant(restaurant)
                          }
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span>Deactivated</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    No restaurants found. Add your first
                    restaurant above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ADMIN REVIEW MANAGEMENT */}
      <section className="admin-section">
        <h2 className="section-title">
          Review Management
        </h2>

        <p className="admin-description">
          View customer feedback and remove inappropriate
          reviews when necessary.
        </p>

        {reviewsLoading ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <tr key={review._id}>
                      <td>
                        <strong>
                          {review.customer?.name || "Unknown"}
                        </strong>
                        <br />
                        <small>
                          {review.customer?.email || ""}
                        </small>
                      </td>

                      <td>
                        {review.restaurant?.name ||
                          "Restaurant unavailable"}
                      </td>

                      <td>
                        <span className="rating-stars">
                          {renderStars(review.rating)}
                        </span>
                        <br />
                        <strong>{review.rating} / 5</strong>
                      </td>

                      <td>{review.reviewText}</td>

                      <td>
                        {review.createdAt
                          ? new Date(
                              review.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <button
                          className="deactivate-button"
                          onClick={() =>
                            handleDeleteReview(review)
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      No customer reviews available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
