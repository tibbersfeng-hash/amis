import React, { useEffect } from 'react';
import { Loading } from './components/Loading';
import { initLocale, getLocale } from './utils/locale';
import ShowcaseApp from './showcase/ShowcaseApp';
import ListPage from './pages/ListPage';
import TestDashboard from './pages/TestDashboard';

const RemotePage = React.lazy(() => import('./pages/RemotePage'));

function App() {
  useEffect(() => {
    initLocale();
  }, []);

  // Showcase route
  if (window.location.pathname === '/showcase') {
    return <ShowcaseApp />;
  }

  // Remote page route — lazy loaded with Amis SDK
  if (window.location.pathname === '/remote') {
    return (
      <React.Suspense fallback={<div className="lazy-loading"><Loading /></div>}>
        <RemotePage />
      </React.Suspense>
    );
  }

  // List page route
  if (window.location.pathname === '/list') {
    return <ListPage />;
  }

  // Root route: test dashboard
  if (window.location.pathname === '/' || window.location.pathname === '') {
    return <TestDashboard />;
  }

  // Unknown route
  return <Loading />;
}

export default App;
