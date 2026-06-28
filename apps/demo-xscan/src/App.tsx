import { DemoPage } from 'pages/DemoPage';
import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DemoPage />} />
    </Routes>
  );
}
