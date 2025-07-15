import { useEffect, useState, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import request from '../utils/request';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('isAuth', 'GET');

      if (res.ok) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <div>Chargement...</div>;
  }

  return isAuth ? children : <Navigate to="/authentification" replace />;
}

export default PrivateRoute;
