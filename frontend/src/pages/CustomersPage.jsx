import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("customers/", {
        params: {
          search: debouncedSearch,
          page,
        },
      });

      setCustomers(response.data.results);
      setPagination({
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      setError("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [debouncedSearch, page]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmed) return;

    try {
      await api.delete(`customers/${id}/`);
      fetchCustomers();
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  return (
    <div>
      <h1>Customers</h1>

      <div style={{ marginBottom: "16px" }}>
        <Link to="/customers/new">
          <button>New Customer</button>
        </Link>
      </div>

      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading customers...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && customers.length === 0 && <p>No customers found.</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <Link to={`/customers/${customer.id}`}>{customer.full_name}</Link>
              </td>
              <td>{customer.email}</td>
              <td>{customer.company}</td>
              <td>
                <Link to={`/customers/${customer.id}/edit`}>
                  <button>Edit</button>
                </Link>
                <button
                  style={{ marginLeft: "8px" }}
                  onClick={() => handleDelete(customer.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <button
          disabled={!pagination.previous}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <button
          disabled={!pagination.next}
          onClick={() => setPage(page + 1)}
          style={{ marginLeft: "10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CustomersPage;