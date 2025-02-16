import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';
ReactDOM.createRoot(document.getElementById('root')).render(_jsxs(React.StrictMode, { children: [_jsx(Toaster, { richColors: true, position: "bottom-right" }), _jsx(App, {})] }));
