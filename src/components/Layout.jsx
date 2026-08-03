import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const backendUrl = import.meta.env.VITE_BACKEND_API || 'http://localhost:5000';
    const sseUrl = `${backendUrl}/events?token=${encodeURIComponent(token)}`;

    let eventSource;
    let reconnectTimeout;

    const connectSSE = () => {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type !== 'connected') {
            // Dispatch custom event to let pages know something changed
            const customEvent = new CustomEvent('sse-update', { detail: data });
            window.dispatchEvent(customEvent);
          }
        } catch (e) {
          console.error('Error parsing SSE event data:', e);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE connection error, attempting reconnect...', err);
        eventSource.close();
        reconnectTimeout = setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
