import type React from 'react';

export function LandingPage(): React.JSX.Element {
  return (
    <div>
      <h1>Monorepo Starter</h1>
      <p>A selective-extraction monorepo starter with Vite, React, and Hono.</p>
      <ul>
        <li>Client: Vite + React + TypeScript</li>
        <li>Server: Hono + TypeScript</li>
        <li>Tooling: Turbo, pnpm workspaces, oxlint, Syncpack</li>
      </ul>
    </div>
  );
}
