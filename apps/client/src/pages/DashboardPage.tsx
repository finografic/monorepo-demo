import { useEffect, useState } from 'react';
import type React from 'react';

import { apiBaseUrl } from '../lib/api-base-url';

interface HealthResponse {
  status: string;
  timestamp: string;
}

export function DashboardPage(): React.JSX.Element {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl()}/api/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Health check failed: ${res.status} ${res.statusText}`);
        }

        return res.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {health && (
        <pre className="ml-2" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
      {!health && !error && <p>Loading...</p>}
    </div>
  );
}
