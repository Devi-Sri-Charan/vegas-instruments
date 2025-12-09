import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './styles/custom.css';

createRoot(document.getElementById('root')).render(<App />);
