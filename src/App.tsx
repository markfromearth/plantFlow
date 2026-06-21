import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerRoutes from './components/CustomerRoutes';
import OperatorRoutes from './components/OperatorRoutes';
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
        <Route path="/operator/*" element={<OperatorRoutes />} />
        <Route path="/*" element={<CustomerRoutes />} />
      </Routes>
      <RoleSwitcher />
    </>
  );
}
