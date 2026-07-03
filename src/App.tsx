import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerRoutes from './components/CustomerRoutes';
import OperatorRoutes from './components/OperatorRoutes';
import LandingPage from './components/LandingPage';
import RoleSwitcher from './components/RoleSwitcher';
import { useStore } from './store';

export default function App() {
  const { init } = useStore();

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/operator/*" element={<OperatorRoutes />} />
        <Route path="/customer/*" element={<CustomerRoutes />} />
      </Routes>
      <RoleSwitcher />
    </>
  );
}

