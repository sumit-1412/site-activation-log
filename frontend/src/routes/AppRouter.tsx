import { Navigate, Route, Routes } from 'react-router-dom';
import { PocModal } from '../components/modals/PocModal';
import { StatusModal } from '../components/modals/StatusModal';
import { VisitModal } from '../components/modals/VisitModal';
import { NavigationBridge } from '../components/NavigationBridge';
import { ConnectionError } from '../components/ui/ConnectionError';
import { DbStatusBar } from '../components/ui/DbStatusBar';
import { Toast } from '../components/ui/Toast';
import { useApp } from '../context/AppContext';
import { ClientLayout } from '../layouts/ClientLayout';
import { InternalLayout } from '../layouts/InternalLayout';
import { LoginPage } from '../pages/LoginPage';
import { HospitalsPage } from '../pages/HospitalsPage';
import { ClientPage } from '../pages/ClientPage';
import { DocsPage } from '../pages/DocsPage';
import { HomePage } from '../pages/HomePage';
import { InfoPage } from '../pages/InfoPage';
import { NudgePage } from '../pages/NudgePage';
import { SetupPage } from '../pages/SetupPage';
import { TimelinePage } from '../pages/TimelinePage';
import { VisitsPage } from '../pages/VisitsPage';
import { ROUTES } from './paths';
import { AuthGuard } from './AuthGuard';
import { HospitalGuard } from './HospitalGuard';

export function AppRouter() {
  const { loaded, dbStatus, dbError, bootError, retryConnection } = useApp();

  if (!loaded || dbStatus === 'checking') {
    return (
      <div className="flex min-h-dvh items-center justify-center text-ink2">
        {dbStatus === 'checking' ? 'Checking MongoDB connection…' : 'Loading…'}
      </div>
    );
  }

  if (dbStatus === 'disconnected' || bootError) {
    return (
      <ConnectionError
        title={bootError?.title ?? 'MongoDB not connected'}
        message={bootError?.message ?? dbError ?? 'MongoDB is not connected'}
        hint={
          bootError?.hint ??
          'Check that the Go API is running (npm run dev:api or go run ./cmd/server) and MONGODB_URI in backend/.env is correct.'
        }
        onRetry={retryConnection}
      />
    );
  }

  return (
    <>
      <DbStatusBar />
      <NavigationBridge />
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<InternalLayout />}>
            <Route path={ROUTES.hospitals} element={<HospitalsPage />} />
            <Route path={ROUTES.hospitalNew} element={<SetupPage />} />
            <Route path="/hospitals/:id/edit" element={<SetupPage />} />
            <Route element={<HospitalGuard />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route path={ROUTES.timeline} element={<TimelinePage />} />
              <Route path={ROUTES.visits} element={<VisitsPage />} />
              <Route path={ROUTES.docs} element={<DocsPage />} />
              <Route path={ROUTES.nudge} element={<NudgePage />} />
              <Route path={ROUTES.info} element={<InfoPage />} />
            </Route>
          </Route>
          <Route element={<HospitalGuard />}>
            <Route element={<ClientLayout />}>
              <Route path={ROUTES.client} element={<ClientPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<Navigate to={ROUTES.hospitals} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.hospitals} replace />} />
      </Routes>
      <StatusModal />
      <VisitModal />
      <PocModal />
      <Toast />
    </>
  );
}
