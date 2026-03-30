import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CustomerCreatePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const frontendErrors = validateForm();
    if (Object.keys(frontendErrors).length > 0) {
      setErrors(frontendErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await api.post("customers/", form);
      navigate(`/customers/${response.data.id}`);
    } catch (err) {
      const data = err.response?.data || {};

      setErrors({
        first_name: Array.isArray(data.first_name) ? data.first_name[0] : "",
        last_name: Array.isArray(data.last_name) ? data.last_name[0] : "",
        email: Array.isArray(data.email) ? data.email[0] : "",
        phone: Array.isArray(data.phone) ? data.phone[0] : "",
        company: Array.isArray(data.company) ? data.company[0] : "",
        general: data.detail || "Failed to create customer.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>New Customer</h1>

      <form className="card" onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="First name"
          value={form.first_name}
          onChange={handleChange}
        />
        {errors.first_name && <p className="error-text">{errors.first_name}</p>}

        <input
          name="last_name"
          placeholder="Last name"
          value={form.last_name}
          onChange={handleChange}
        />
        {errors.last_name && <p className="error-text">{errors.last_name}</p>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        {errors.phone && <p className="error-text">{errors.phone}</p>}

        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />
        {errors.company && <p className="error-text">{errors.company}</p>}

        <label style={{ marginTop: "12px" }}>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active
        </label>

        {errors.general && <p className="error-text">{errors.general}</p>}

        <button style={{ marginTop: "12px" }} type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Customer"}
        </button>
      </form>
    </div>
  );
}

export default CustomerCreatePage;