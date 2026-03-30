import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [stageFilter, setStageFilter] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    customer: "",
    title: "",
    amount: "",
    stage: "NEW",
    expected_close: "",
  });

  const fetchCustomers = async () => {
    try {
      const response = await api.get("customers/");
      setCustomers(response.data.results || []);
    } catch (err) {
      setError("Failed to load customers.");
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("opportunities/", {
        params: stageFilter ? { stage: stageFilter } : {},
      });

      setOpportunities(response.data);
    } catch (err) {
      setError("Failed to load opportunities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [stageFilter]);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setFormError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.customer || !form.title.trim() || !form.amount) {
      setFormError("Customer, title and amount are required.");
      return;
    }

    try {
      await api.post("opportunities/", {
        ...form,
        amount: Number(form.amount),
        customer: Number(form.customer),
      });

      setForm({
        customer: "",
        title: "",
        amount: "",
        stage: "NEW",
        expected_close: "",
      });

      fetchOpportunities();
    } catch (err) {
      const stageError = err.response?.data?.stage;
      const detailError = err.response?.data?.detail;

      setFormError(
        (Array.isArray(stageError) ? stageError[0] : stageError) ||
          detailError ||
          "Failed to create opportunity."
      );
    }
  };

  const handleStageChange = async (id, newStage) => {
    try {
      await api.patch(`opportunities/${id}/`, {
        stage: newStage,
      });

      fetchOpportunities();
    } catch (err) {
      const stageError = err.response?.data?.stage;

      alert(
        (Array.isArray(stageError) ? stageError[0] : stageError) ||
          "Failed to update stage."
      );
    }
  };

  return (
    <div>
      <h1>Opportunities</h1>

      <div className="card">
        <h2>Create Opportunity</h2>

        <form onSubmit={handleCreate}>
          <select
            name="customer"
            value={form.customer}
            onChange={handleFormChange}
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name}
              </option>
            ))}
          </select>

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleFormChange}
          />

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={handleFormChange}
          />

          <input
            name="expected_close"
            type="date"
            value={form.expected_close}
            onChange={handleFormChange}
          />

          {formError && <p className="error-text">{formError}</p>}

          <button type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <h2>Filter</h2>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="NEW">New</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="PROPOSAL">Proposal</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>
      </div>

      {loading && <p>Loading opportunities...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && opportunities.length === 0 && <p>No opportunities found.</p>}

      <div className="card">
        <h2>Opportunity List</h2>

        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Stage</th>
              <th>Change Stage</th>
            </tr>
          </thead>

          <tbody>
            {opportunities.map((opportunity) => (
              <tr key={opportunity.id}>
                <td>
                  <Link to={`/customers/${opportunity.customer}`}>
                    {opportunity.customer_name}
                  </Link>
                </td>
                <td>{opportunity.title}</td>
                <td>{opportunity.amount}</td>
                <td>{opportunity.stage}</td>
                <td>
                  <select
                    value={opportunity.stage}
                    onChange={(e) =>
                      handleStageChange(opportunity.id, e.target.value)
                    }
                  >
                    <option value="NEW">New</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OpportunitiesPage;