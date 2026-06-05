import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from './paths';

/** Redirects to setup when the onboarding gate has not been dismissed. */
export function SetupGuard() {
  const { showSetup } = useApp();
  if (showSetup) return <Navigate to={ROUTES.setup} replace />;
  return <Outlet />;
}
