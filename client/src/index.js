import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './redux/store'; // Redux store
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter as Router } from 'react-router-dom';  // <-- Here we are using BrowserRouter

// Create a QueryClient instance
const queryClient = new QueryClient();

// Create root element
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <Router> {/* Only one Router */}
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </Router>
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

reportWebVitals();
