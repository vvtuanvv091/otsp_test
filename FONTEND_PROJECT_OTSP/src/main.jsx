import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import Providers from './app/Providers';

// Import CSS themes matching PROJECT_OTSP exactly
import './styles/otsp-theme.css';
import './styles/otsp-red-theme.css';
import './styles/otsp-components.css';
import './styles/otsp-home.css';
import './styles/otsp-pages.css';
import './styles/student-sidebar.css';
import './styles/tutor-sidebar.css';
import './styles/tutor-ui-refresh.css';

// Apply the saved theme before React paints the page, including auth routes.
const savedTheme = localStorage.getItem('otsp-theme') === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-bs-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </React.StrictMode>
);
