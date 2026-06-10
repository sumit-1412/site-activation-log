import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from './paths';

/** Requires a selected hospital before internal/client screens. */
export function HospitalGuard() {
  const { currentHospitalId } = useApp();
  const location = useLocation();

  if (!currentHospitalId) {
    return <Navigate to={ROUTES.hospitals} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
