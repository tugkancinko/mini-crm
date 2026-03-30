import { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("dashboard/summary/");
        setData(response.data);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="card-grid">
        <div className="card">
          <h3>Total Customers</h3>
          <p>{data.kpis.total_customers}</p>
        </div>

        <div className="card">
          <h3>Won Revenue This Month</h3>
          <p>{data.kpis.won_revenue_this_month}</p>
        </div>

        <div className="card">
          <h3>Active Opportunities</h3>
          <p>{data.kpis.active_opportunities}</p>
        </div>

        <div className="card">
          <h3>New Customers Last 30 Days</h3>
          <p>{data.kpis.new_customers_last_30_days}</p>
        </div>
      </div>

      <div className="card">
        <h2>Recent Customers</h2>
        {data.recent_customers.length === 0 ? (
          <p>No recent customers.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.opportunities_by_stage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Opportunities by Stage</h2>
        {data.opportunities_by_stage.length === 0 ? (
          <p>No opportunities yet.</p>
        ) : (
          <ul>
            {data.opportunities_by_stage.map((item) => (
              <li key={item.stage}>
                {item.stage}: {item.count}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;