import React, { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInMinutes,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import arSA from 'date-fns/locale/ar-SA';
import enUS from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';

import { useOwnerWorkingHours } from '../../hooks/owner/useWorkingHours';
import CalendarToolbar from './CalendarToolbar';
import TimeGrid from './TimeGrid';

const locales = {
  'ar-SA': arSA,
  'en-US': enUS,
};

const toDateTime = (date, time, fallbackTime = '09:00') => {
  const safeDate = date || new Date().toISOString().split('T')[0];
  const safeTime = time || fallbackTime;
  const [y, m, d] = safeDate.split('-').map((n) => Number(n));
  const [hh, mm = '0'] = safeTime.split(':').map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, Number.isFinite(mm) ? mm : 0);
};

const parseHourMinute = (value, defaultHour) => {
  if (!value) return defaultHour;
  const [hourStr, minuteStr = '0'] = value.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  return { hour: Number.isFinite(hour) ? hour : defaultHour, minute: Number.isFinite(minute) ? minute : 0 };
};

const deriveWorkingBounds = (workingHours) => {
  const openDays = (workingHours || []).filter(
    (day) => !day.is_closed && day.open_time && day.close_time
  );
  if (!openDays.length) {
    return { minHour: 9, minMinute: 0, maxHour: 21, maxMinute: 0 };
  }

  const first = openDays.reduce(
    (acc, day) => {
      const { hour, minute } = parseHourMinute(day.open_time, acc.hour);
      if (hour < acc.hour || (hour === acc.hour && minute < acc.minute)) {
        return { hour, minute };
      }
      return acc;
    },
    { hour: 23, minute: 59 }
  );

  const last = openDays.reduce(
    (acc, day) => {
      const { hour, minute } = parseHourMinute(day.close_time, acc.hour);
      if (hour > acc.hour || (hour === acc.hour && minute > acc.minute)) {
        return { hour, minute };
      }
      return acc;
    },
    { hour: 0, minute: 0 }
  );

  return { minHour: first.hour, minMinute: first.minute, maxHour: last.hour, maxMinute: last.minute };
};

const ViewTypes = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

const BookingCalendar = ({ bookings = [], loading, onSelectBooking }) => {
  const { t, i18n } = useTranslation();
  const isRTL = (typeof document !== 'undefined' && document?.dir === 'rtl') || i18n.language?.startsWith('ar');
  const culture = isRTL ? 'ar-SA' : 'en-US';
  const locale = locales[culture];

  const [view, setView] = useState(ViewTypes.WEEK);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { workingHours } = useOwnerWorkingHours();

  const { minHour, minMinute, maxHour, maxMinute } = useMemo(
    () => deriveWorkingBounds(workingHours),
    [workingHours]
  );

  const minTime = useMemo(() => setMinutes(setHours(startOfDay(new Date()), minHour), minMinute), [minHour, minMinute]);
  const maxTime = useMemo(() => setMinutes(setHours(endOfDay(new Date()), maxHour), maxMinute), [maxHour, maxMinute]);

  const events = useMemo(
    () =>
      bookings.map((booking) => {
        const start = toDateTime(booking.booking_date, booking.booking_time);
        const end = booking.end_time
          ? toDateTime(booking.booking_date, booking.end_time, booking.booking_time)
          : new Date(
              start.getTime() +
                ((booking.duration_minutes ||
                  booking.services?.duration_minutes ||
                  booking.services?.duration ||
                  60) *
                  60000)
            );

        const serviceName =
          booking.services?.name ||
          booking.home_services?.name ||
          t('bookings.serviceUnknown', 'Service');

        const resourceTitle =
          booking.employee_name ||
          booking.staff_name ||
          booking.assigned_to ||
          booking.employee?.name ||
          booking.staff?.name ||
          '';

        return {
          id: booking.id,
          title: serviceName,
          start,
          end,
          resourceId: resourceTitle || 'main',
          resourceTitle: resourceTitle || t('bookings.calendar.defaultResource', 'Main chair'),
          status: booking.status || 'pending',
          clientName: booking.customer_name || t('bookings.customerUnknown', 'Walk-in'),
          serviceName,
          booking,
        };
      }),
    [bookings, t]
  );

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: isRTL ? 6 : 0 }),
    [currentDate, isRTL]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const viewDays = view === ViewTypes.DAY ? [currentDate] : weekDays;

  const rangeLabel = useMemo(() => {
    if (view === ViewTypes.MONTH) {
      return format(currentDate, 'LLLL yyyy', { locale });
    }

    if (view === ViewTypes.DAY) {
      return format(currentDate, 'eeee dd LLL yyyy', { locale });
    }

    const end = endOfWeek(currentDate, { weekStartsOn: isRTL ? 6 : 0 });
    return `${format(weekStart, 'dd LLL', { locale })} – ${format(end, 'dd LLL yyyy', { locale })}`;
  }, [currentDate, view, locale, weekStart, isRTL]);

  const headerDate = useMemo(
    () => format(currentDate, 'EEEE dd MMMM yyyy', { locale }),
    [currentDate, locale]
  );

  const handleNavigate = (type) => {
    if (type === 'TODAY') {
      setCurrentDate(new Date());
      return;
    }

    const delta = type === 'NEXT' ? 1 : -1;
    if (view === ViewTypes.MONTH) {
      setCurrentDate(addMonths(currentDate, delta));
      return;
    }
    if (view === ViewTypes.WEEK) {
      setCurrentDate(addWeeks(currentDate, delta));
      return;
    }
    setCurrentDate(addDays(currentDate, delta));
  };

  const handleViewChange = (nextView) => {
    setView(nextView);
  };

  const MonthView = ({ current, eventsList }) => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: isRTL ? 6 : 0 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: isRTL ? 6 : 0 });
    const days = [];

    for (let day = start; day <= end; day = addDays(day, 1)) {
      days.push(day);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    const dayEventsMap = useMemo(() => {
      const map = new Map();
      days.forEach((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsList.filter((event) => isSameDay(event.start, day));
        map.set(key, dayEvents);
      });
      return map;
    }, [days, eventsList]);

    return (
      <div className="min-w-[960px]">
        <div className="grid grid-cols-7 divide-x divide-slate-200 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-600">
          {(isRTL ? [...weeks[0]].reverse() : weeks[0]).map((day) => (
            <div key={day.toISOString()} className="px-3 py-2 text-center">
              {format(day, 'EEE', { locale })}
            </div>
          ))}
        </div>
        <div className="grid grid-rows-6">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid min-h-[140px] grid-cols-7 divide-x divide-slate-200 border-b border-slate-200 last:border-b-0"
            >
              {(isRTL ? [...week].reverse() : week).map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayEvents = dayEventsMap.get(key) || [];
                const isCurrentMonth = isSameMonth(day, current);
                const dayNumber = format(day, 'd', { locale });
                const visibleEvents = dayEvents.slice(0, 2);
                const remaining = dayEvents.length - visibleEvents.length;

                return (
                  <div key={day.toISOString()} className="relative bg-white px-3 py-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                          isToday(day) ? 'bg-[#E39B34] text-white' : 'text-slate-800'
                        } ${!isCurrentMonth ? 'text-slate-300' : ''}`}
                      >
                        {dayNumber}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {visibleEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onSelectBooking && onSelectBooking(event.booking)}
                          className="flex w-full items-center gap-2 truncate rounded-lg border border-[#E39B34]/30 bg-[#FFF7EB] px-2 py-1 text-start text-[11px] font-semibold text-[#8a5a12] shadow-sm transition hover:border-[#E39B34] hover:shadow"
                          title={`${event.serviceName} • ${event.clientName}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-[#E39B34]" />
                          <span className="truncate">{event.serviceName}</span>
                        </button>
                      ))}
                      {remaining > 0 && (
                        <button
                          onClick={() => onSelectBooking && dayEvents[0] && onSelectBooking(dayEvents[0].booking)}
                          className="text-[11px] font-semibold text-[#E39B34] underline-offset-2 hover:underline"
                        >
                          {t('bookings.calendar.messages.showMore', '+{{count}} more', { count: remaining })}
                        </button>
                      )}
                      {dayEvents.length === 0 && (
                        <div className="text-[11px] text-slate-300">
                          {t('bookings.calendar.messages.noEvents', 'No bookings in this range.')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-lg shadow-slate-200/60">
      <CalendarToolbar
        date={currentDate}
        view={view}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        label={rangeLabel}
        isRTL={isRTL}
        t={t}
        culture={culture}
        headerDate={headerDate}
      />

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-md">
        {view === ViewTypes.MONTH ? (
          <MonthView current={currentDate} eventsList={events} />
        ) : (
          <TimeGrid
            days={view === ViewTypes.DAY ? [currentDate] : weekDays}
            events={events}
            culture={culture}
            isRTL={isRTL}
            minTime={minTime}
            maxTime={maxTime}
            onSelectBooking={onSelectBooking}
          />
        )}
      </div>

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur">
          <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white px-4 py-3 shadow-md">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-100 border-t-[#E39B34]" />
            <span className="text-sm font-semibold text-slate-700">
              {t('bookings.calendar.loading', 'Loading bookings...')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
