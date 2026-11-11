
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);

      setMessage(response.data.message || "Registration successful!");

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">

      <section className="auth-brand-panel">
        <div className="brand-content">

          <div className="brand-logo">SW.</div>

          <p className="brand-label">JOIN THE SMART WINNR COMMUNITY</p>

          <h1>
            Good food.
            <br />
            Great stories.
            <br />
            Honest reviews.
          </h1>

          <p className="brand-description">
            Create your account to discover restaurants,
            rate your dining experiences and help others
            make better food choices.
          </p>

          <div className="brand-footer">
            Discover. Rate. Experience.
          </div>

        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">

          <div className="mobile-brand">
            <span>SW.</span> Smart Winnr
          </div>

          <div className="form-heading">
            <span className="form-eyebrow">CREATE YOUR ACCOUNT</span>

            <h2>Join Smart Winnr</h2>

            <p>
              Enter your details below to create your customer account.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success-alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-auth-form">

            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                minLength="2"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="8-16 characters"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                maxLength="16"
                required
              />

              <span className="input-hint">
                Use uppercase, lowercase, a number and a special character.
              </span>
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <div className="auth-switch">
            Already have an account?
            <Link to="/"> Sign In</Link>
          </div>

          <p className="auth-bottom-note">
            Smart Winnr · Restaurant Rating and Review Platform
          </p>

        </div>
      </section>

    </div>
  );
}

export default Register;
