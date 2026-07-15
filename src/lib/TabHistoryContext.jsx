import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TabHistoryContext = createContext(null);

const TAB_ROOTS = ['/', '/community', '/nutrition-hub', '/profile'];

const getTabRoot = (pathname) => {
  if (pathname === '/') return '/';
  for (const root of TAB_ROOTS) {
    if (root !== '/' && (pathname === root || pathname.startsWith(root + '/'))) {
      return root;
    }
  }
  return null;
};

export function TabHistoryProvider({ children }) {
  const location = useLocation();
  const [tabLocations, setTabLocations] = useState({});
  const locationRef = useRef(location);

  useEffect(() => {
    const tabRoot = getTabRoot(location.pathname);
    if (tabRoot) {
      setTabLocations((prev) => ({ ...prev, [tabRoot]: location.pathname }));
    }
    locationRef.current = location;
  }, [location.pathname]);

  const getTabLocation = (tabRoot) => tabLocations[tabRoot] || tabRoot;

  return (
    <TabHistoryContext.Provider value={{ getTabLocation }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  const ctx = useContext(TabHistoryContext);
  if (!ctx) return { getTabLocation: (r) => r };
  return ctx;
}