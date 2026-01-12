
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

function init() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Could not find root element 'root'. Retrying in 100ms...");
    setTimeout(init, 100);
    return;
  }

  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
