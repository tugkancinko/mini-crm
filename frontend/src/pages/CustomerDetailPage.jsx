import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomer = async () => {
    try {
      const response = await api.get(`customers/${id}/`);
      setCustomer(response.data);
    } catch (err) {
      setError("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();

    if (!noteContent.trim()) return;

    try {
      await api.post(`customers/${id}/notes/`, {
    content: noteContent,
    });

      setNoteContent("");
      fetchCustomer();
    } catch (err) {
      alert("Failed to add note.");
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmed) return;

    try {
      await api.delete(`customers/${id}/`);
      navigate("/customers");
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  if (loading) return <p>Loading customer...</p>;
  if (error) return <p>{error}</p>;
  if (!customer) return <p>Customer not found.</p>;

  return (
    <div>
      <h1>{customer.full_name}</h1>

      <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
        <Link to={`/customers/${id}/edit`}>
          <button>Edit Customer</button>
        </Link>
        <button onClick={handleDelete}>Delete Customer</button>
      </div>

      <div className="card">
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone || "-"}</p>
        <p><strong>Company:</strong> {customer.company || "-"}</p>
      </div>

      <div className="card">
        <h2>Add Note</h2>
        <form onSubmit={handleAddNote}>
          <textarea
            rows="4"
            style={{ width: "100%", marginBottom: "12px" }}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write a note..."
          />
          <button type="submit">Add Note</button>
        </form>
      </div>

      <div className="card">
        <h2>Notes</h2>
        {customer.notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          <ul>
            {customer.notes.map((note) => (
              <li key={note.id}>
                {note.content}{" "}
                <small>
                  - {note.created_by?.username} / {new Date(note.created_at).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <h2>Opportunities</h2>
        {customer.opportunities.length === 0 ? (
          <p>No opportunities yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {customer.opportunities.map((opportunity) => (
                <tr key={opportunity.id}>
                  <td>{opportunity.title}</td>
                  <td>{opportunity.amount}</td>
                  <td>{opportunity.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CustomerDetailPage;