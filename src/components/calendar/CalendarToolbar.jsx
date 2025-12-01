import React, { useMemo } from 'react';
import { format } from 'date-fns';
import arSA from 'date-fns/locale/ar-SA';
import enUS from 'date-fns/locale/en-US';

const locales = {
  'ar-SA': arSA,
  'en-US': enUS,
};

const VIEW_LABELS = {
  day: 'bookings.calendar.dayView',
  week: 'bookings.calendar.weekView',
  month: 'bookings.calendar.monthView',
};

const CalendarToolbar = ({ date, label, headerDate, onNavigate, onView, view, isRTL, t, culture }) => {
  const locale = locales[culture] || enUS;
  const secondaryLocale = culture === 'ar-SA' ? locales['en-US'] : locales['ar-SA'];

  const altHeader = useMemo(() => format(date, 'EEEE dd MMM yyyy', { locale: secondaryLocale }), [date, secondaryLocale]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">{headerDate}</p>
          <p className="text-xs text-slate-500">{altHeader}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('TODAY')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#cf8930]"
          >
            {t('bookings.calendar.messages.today', 'Today')}
          </button>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-1 shadow-inner">
            <button
              onClick={() => onNavigate('PREV')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-slate-700 transition hover:bg-white"
              aria-label={t('bookings.calendar.messages.previous', 'Previous')}
            >
              {isRTL ? '›' : '‹'}
            </button>
            <div className="px-3 text-sm font-semibold text-slate-900">{label}</div>
            <button
              onClick={() => onNavigate('NEXT')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold text-slate-700 transition hover:bg-white"
              aria-label={t('bookings.calendar.messages.next', 'Next')}
            >
              {isRTL ? '‹' : '›'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-inner">
          {['day', 'week', 'month'].map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                view === v ? 'bg-[#E39B34] text-white shadow-sm shadow-[#E39B34]/30' : 'text-slate-700 hover:bg-white'
              }`}
            >
              {t(VIEW_LABELS[v], v === 'day' ? 'Day' : v === 'week' ? 'Week' : 'Month')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-inner">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#E39B34]" />
          <span>{t('bookings.calendar.messages.time', 'Time')}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-800">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;
