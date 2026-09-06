import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserRecordProvider } from './context/UserRecordContext';
import { AppRouter } from './router/AppRouter';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserRecordProvider>
          <AppRouter />
        </UserRecordProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
