import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerNavigate } from '../lib/navigation';

/** Registers react-router navigate for use outside components (e.g. AppContext). */
export function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate]);
  return null;
}
