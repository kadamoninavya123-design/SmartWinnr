
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "owner") {
        navigate("/owner");
      } else {
        navigate("/customer");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
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

          <p className="brand-label">RESTAURANT DISCOVERY PLATFORM</p>

          <h1>
            Every meal has
            <br />
            a story worth
            <br />
            sharing.
          </h1>

          <p className="brand-description">
            Discover restaurants, explore customer experiences
            and share your honest reviews with Smart Winnr.
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
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your details to continue exploring Smart Winnr.
            </p>
          </div>

          {error && (
            <div className="auth-alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="modern-auth-form">

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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          <div className="auth-switch">
            Don't have an account?
            <Link to="/register"> Create Account</Link>
          </div>

          <p className="auth-bottom-note">
            Smart Winnr · Restaurant Rating and Review Platform
          </p>

        </div>
      </section>

    </div>
  );
}

export default Login;
