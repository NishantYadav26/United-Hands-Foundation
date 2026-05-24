import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { getCached } from '@/lib/apiClient';

const NEW_EVENT_WINDOW_DAYS = 21;

const getEventTimestamp = (event) => {
  const candidates = [event?.created_at, event?.createdAt, event?.updated_at, event?.updatedAt, event?.date, event?.event_date];
  const value = candidates.find(Boolean);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

export default function FloatingEventsButton() {
  const [events, setEvents] = useState([]);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getCached('/events', { cacheTtlMs: 120000 })
      .then((response) => {
        if (!mounted) return;
        const payload = Array.isArray(response?.data) ? response.data : [];
        setEvents(payload.slice(0, 5));
        setVisible(payload.length > 0);
      })
      .catch(() => {
        if (!mounted) return;
        setVisible(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const hasNewEvents = useMemo(() => {
    const cutoff = Date.now() - (NEW_EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    return events.some((event) => {
      const ts = getEventTimestamp(event);
      return ts ? ts >= cutoff : true;
    });
  }, [events]);

  if (!visible) return null;

  if (location.pathname.startsWith('/uhf-admin') || location.pathname.startsWith('/events')) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/events')}
      aria-label="View new events"
      className={`floating-events-btn ${hasNewEvents ? 'floating-events-btn--pulse' : ''}`}
    >
      <CalendarDays size={18} strokeWidth={2.1} aria-hidden="true" />
      <span>NEW EVENTS</span>
    </button>
  );
}
