import React, { useEffect, useState } from "react";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    console.log("Dashboard mounted");

    // Example fetch call (adjust endpoint if needed)
    fetch("http://localhost:5000/api/dashboard-data")
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));

    return () => console.log("Dashboard unmounted");
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading dashboard data...</p>
      )}
    </div>
  );
};

export default Dashboard;
