import { useEffect, useState } from 'react';
import type React from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
}

export function DashboardPage(): React.JSX.Element {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>Server Health</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {health && (
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      {!health && !error && <p>Loading...</p>}
    </div>
  );
}
