import React, { useMemo } from 'react';
import { format } from 'date-fns';
import arSA from 'date-fns/locale/ar-SA';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'ar-SA': arSA,
  'en-US': enUS,
};

const BookingEventCard = ({ event, culture, onClick }) => {
  const locale = locales[culture] || enUS;

  const timeRange = useMemo(() => {
    const startLabel = format(event.start, 'p', { locale });
    const endLabel = format(event.end, 'p', { locale });
    return `${startLabel} – ${endLabel}`;
  }, [event.start, event.end, locale]);

  return (
    <button
      onClick={onClick}
      className="group flex h-full w-full flex-col justify-between rounded-lg border border-[#E39B34]/50 bg-[#FFF7EB] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#d78929] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#E39B34]/30"
      title={`${event.clientName} • ${event.serviceName} • ${timeRange}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{event.serviceName}</p>
        <span className="mt-0.5 inline-flex h-2 w-2 shrink-0 rounded-full bg-[#E39B34]" />
      </div>
      <p className="text-xs font-medium text-slate-600 line-clamp-1">{event.clientName}</p>
      <p className="text-[11px] font-semibold text-[#b0610f]">{timeRange}</p>
    </button>
  );
};

export default BookingEventCard;
