import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes/AppRouter';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppTree() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <AppTree />
        </GoogleOAuthProvider>
      ) : (
        <AppTree />
      )}
    </BrowserRouter>
  );
}
