import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FarmSetup from './pages/FarmSetup';
import Crops from './pages/Crops';
import Readings from './pages/Readings';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import CropPrices from './pages/CropPrices';
import CropScan from './pages/CropScan';
import Devices from './pages/Devices';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/farm" element={<FarmSetup />} />
                <Route path="/crops" element={<Crops />} />
                <Route path="/readings" element={<Readings />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/prices" element={<CropPrices />} />
                <Route path="/scan" element={<CropScan />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  );
}
