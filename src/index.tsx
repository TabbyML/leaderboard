import React from "react";
import ReactDOM from 'react-dom/client';
import './index.css';
import { ThemeProvider } from './components/theme-provider';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

