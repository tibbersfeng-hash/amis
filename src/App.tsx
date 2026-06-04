import React, { useEffect } from 'react';
import { Loading } from './components/Loading';
import { initLocale, getLocale } from './utils/locale';
import ShowcaseApp from './showcase/ShowcaseApp';
import ListPage from './pages/ListPage';

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

  // Default fallback: redirect to hotel list
  if (window.location.pathname === '/' || window.location.pathname === '') {
    window.location.href = '/list?dataType=hotel-basic';
    return <Loading />;
  }

  // Unknown route
  return <Loading />;
}

export default App;
