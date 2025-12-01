import React, { useMemo, useState } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay,  } from 'date-fns';
import arSA from 'date-fns/locale/ar-SA';
import enUS from 'date-fns/locale/en-US';
import { useTranslation } from 'react-i18next';
import { useOwnerWorkingHours } from '../../hooks/owner/useWorkingHours';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';

const locales = {
  'ar-SA': arSA,
  'en-US': enUS,
};

const statusPalette = {
  pending: {
    className: 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm',
    accent: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800',
  },
  confirmed: {
    className: 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm',
    accent: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  completed: {
    className: 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-800',
  },
  cancelled: {
    className: 'bg-gray-100 border-gray-300 text-gray-700',
    accent: 'bg-gray-500',
    badge: 'bg-gray-200 text-gray-700',
  },
  no_show: {
    className: 'bg-red-50 border-red-200 text-red-900',
    accent: 'bg-red-500',
    badge: 'bg-red-100 text-red-800',
  },
};

// Utility functions
const toDateTime = (date, time, fallbackTime = '09:00') => {
  const safeDate = date || new Date().toISOString().split('T')[0];
  const safeTime = time || fallbackTime;
  const [y, m, d] = safeDate.split('-').map(Number);
  const [hh, mm = 0] = safeTime.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

const parseHourMinute = (value, defaultHour) => {
  if (!value) return { hour: defaultHour, minute: 0 };
  const [hourStr, minuteStr = '0'] = value.split(':');
  return {
    hour: Number(hourStr) || defaultHour,
    minute: Number(minuteStr) || 0,
  };
};

const deriveWorkingBounds = (workingHours) => {
  const openDays = (workingHours || []).filter(
    day => !day.is_closed && day.open_time && day.close_time
  );
  
  if (!openDays.length) {
    return { minHour: 7, minMinute: 0, maxHour: 22, maxMinute: 0 };
  }

  const { hour: minHour, minute: minMinute } = openDays.reduce(
    (acc, day) => {
      const time = parseHourMinute(day.open_time, acc.hour);
      return time.hour < acc.hour || (time.hour === acc.hour && time.minute < acc.minute) 
        ? time 
        : acc;
    },
    { hour: 23, minute: 59 }
  );

  const { hour: maxHour, minute: maxMinute } = openDays.reduce(
    (acc, day) => {
      const time = parseHourMinute(day.close_time, acc.hour);
      return time.hour > acc.hour || (time.hour === acc.hour && time.minute > acc.minute) 
        ? time 
        : acc;
    },
    { hour: 0, minute: 0 }
  );

  return { minHour, minMinute, maxHour, maxMinute };
};

// Compact Event Component for overlapping bookings
const CompactBookingEvent = ({ event, culture,  overlapIndex, totalOverlaps }) => {
  const palette = statusPalette[event.status] || statusPalette.pending;
  const width = totalOverlaps > 1 ? `calc(${100 / totalOverlaps}% - 4px)` : '100%';
  const left = totalOverlaps > 1 ? `calc(${overlapIndex * (100 / totalOverlaps)}% + 2px)` : '0';

  return (
    <div
      className={`absolute h-full rounded-lg border-l-2 ${palette.className} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md`}
      style={{ 
        width, 
        left,
        borderLeftColor: palette.accent,
        zIndex: 10 + overlapIndex,
      }}
      title={`${event.clientName} • ${event.serviceName}`}
      onClick={(e) => {
        e.stopPropagation();
        event.onSelect?.(event.booking);
      }}
    >
      <div className="p-1.5 h-full flex flex-col justify-between">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold leading-tight text-gray-900 truncate">
            {event.serviceName}
          </p>
          <p className="text-[10px] text-gray-600 truncate">
            {event.clientName}
          </p>
        </div>
        <p className="text-[9px] font-medium text-gray-500">
          {format(event.start, 'HH:mm', { locale: locales[culture] })}
        </p>
      </div>
    </div>
  );
};

// Main Event Component
const BookingEvent = ({ event, culture, isCompact = false }) => {
  const palette = statusPalette[event.status] || statusPalette.pending;
  
  if (isCompact) {
    return (
      <div
        className={`h-full rounded-lg border-l-3 ${palette.className} cursor-pointer transition-all hover:shadow-md`}
        style={{ borderLeftColor: palette.accent }}
        title={`${event.clientName} • ${event.serviceName}`}
      >
        <div className="p-2 h-full flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-tight text-gray-900 line-clamp-1">
              {event.serviceName}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1">
              {event.clientName}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {format(event.start, 'HH:mm', { locale: locales[culture] })}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${palette.badge}`}>
              {event.statusLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full rounded-lg border-l-3 ${palette.className} p-3 cursor-pointer transition-all hover:shadow-md`}
      style={{ borderLeftColor: palette.accent }}
      title={`${event.clientName} • ${event.serviceName}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
              {event.serviceName}
            </p>
            <p className="text-xs text-gray-600 line-clamp-1">
              {event.clientName}
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${palette.badge} shrink-0 ml-2`}>
            {event.statusLabel}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-gray-500">
            {format(event.start, 'HH:mm', { locale: locales[culture] })} - {format(event.end, 'HH:mm', { locale: locales[culture] })}
          </span>
          {event.resourceTitle && (
            <span className="text-gray-400 truncate ml-2">
              {event.resourceTitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Toolbar Component
const CalendarToolbar = ({ date, onNavigate, onView, view, views, isRTL, t, culture }) => {
  const viewLabels = {
    [Views.DAY]: t('bookings.calendar.dayView', 'Day'),
    [Views.WEEK]: t('bookings.calendar.weekView', 'Week'),
    [Views.MONTH]: t('bookings.calendar.monthView', 'Month'),
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white border-b border-gray-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => onNavigate('PREV')}
              className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
            >
              {isRTL ? '›' : '‹'}
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border-x border-gray-300"
            >
              {t('bookings.calendar.messages.today', 'Today')}
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
            >
              {isRTL ? '‹' : '›'}
            </button>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(date, 'MMMM yyyy', { locale: locales[culture] })}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs font-medium text-gray-600">
              {format(date, 'EEEE, MMMM dd', { locale: locales[culture] })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {views.map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                view === v
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
        </div>
      </div>
    </div>
  );
};

// Overlap detection and grouping
// const groupOverlappingEvents = (events, date) => {
//   const dayEvents = events.filter(event => isSameDay(event.start, date));
//   const grouped = new Map();
  
//   dayEvents.forEach(event => {
//     const hour = event.start.getHours();
//     const key = `${hour}-${event.resourceId}`;
    
//     if (!grouped.has(key)) {
//       grouped.set(key, []);
//     }
//     grouped.get(key).push(event);
//   });
  
//   return grouped;
// };

const BookingCalendar = ({ bookings = [], loading, onSelectBooking }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const culture = isRTL ? 'ar-SA' : 'en-US';
  const [view, setView] = useState(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { workingHours } = useOwnerWorkingHours();

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (date) => startOfWeek(date, { weekStartsOn: isRTL ? 6 : 0 }),
        getDay,
        locales,
      }),
    [isRTL]
  );

  const events = useMemo(() => {
    return bookings.map((booking) => {
      const start = toDateTime(booking.booking_date, booking.booking_time);
      const duration = booking.duration_minutes || 
                      booking.services?.duration_minutes || 
                      booking.services?.duration || 60;
      const end = booking.end_time 
        ? toDateTime(booking.booking_date, booking.end_time, booking.booking_time)
        : new Date(start.getTime() + duration * 60000);

      const serviceName = booking.services?.name || 
                         booking.home_services?.name || 
                         t('bookings.serviceUnknown', 'Service');

      const resourceTitle = booking.employee_name || 
                           booking.staff_name || 
                           booking.assigned_to || 
                           booking.employee?.name || 
                           booking.staff?.name || 
                           t('bookings.calendar.defaultResource', 'Main chair');

      const statusLabel = booking.status 
        ? t(`bookings.status.${booking.status}`, booking.status)
        : '';

      return {
        id: booking.id,
        title: serviceName,
        start,
        end,
        resourceId: booking.employee_id || booking.staff_id || 'main',
        resourceTitle,
        status: booking.status || 'pending',
        statusLabel,
        clientName: booking.customer_name || t('bookings.customerUnknown', 'Walk-in'),
        serviceName,
        booking,
        onSelect: onSelectBooking,
      };
    });
  }, [bookings, t, onSelectBooking]);

  const resources = useMemo(() => {
    const resourceMap = new Map();
    events.forEach((event) => {
      if (!resourceMap.has(event.resourceId)) {
        resourceMap.set(event.resourceId, {
          resourceId: event.resourceId,
          resourceTitle: event.resourceTitle,
        });
      }
    });

    if (resourceMap.size === 0) {
      resourceMap.set('main', {
        resourceId: 'main',
        resourceTitle: t('bookings.calendar.defaultResource', 'Main chair'),
      });
    }

    return Array.from(resourceMap.values());
  }, [events, t]);

  const { minHour, minMinute, maxHour, maxMinute } = useMemo(
    () => deriveWorkingBounds(workingHours),
    [workingHours]
  );

  const minTime = useMemo(() => {
    const time = new Date();
    time.setHours(minHour, minMinute, 0, 0);
    return time;
  }, [minHour, minMinute]);

  const maxTime = useMemo(() => {
    const time = new Date();
    time.setHours(maxHour, maxMinute, 0, 0);
    return time;
  }, [maxHour, maxMinute]);

  const eventPropGetter = () => {
    return {
      className: 'booking-event',
      style: {
        background: 'transparent',
        border: 'none',
        padding: 0,
        margin: 0,
      },
    };
  };

  const handleSelectEvent = (event) => {
    onSelectBooking?.(event.booking);
  };

  const messages = useMemo(
    () => ({
      date: t('bookings.calendar.messages.date', 'Date'),
      time: t('bookings.calendar.messages.time', 'Time'),
      event: t('bookings.calendar.messages.event', 'Booking'),
      allDay: t('bookings.calendar.messages.allDay', 'All day'),
      week: t('bookings.calendar.messages.week', 'Week'),
      work_week: t('bookings.calendar.messages.workWeek', 'Work week'),
      day: t('bookings.calendar.messages.day', 'Day'),
      month: t('bookings.calendar.messages.month', 'Month'),
      previous: t('bookings.calendar.messages.previous', 'Previous'),
      next: t('bookings.calendar.messages.next', 'Next'),
      today: t('bookings.calendar.messages.today', 'Today'),
      agenda: t('bookings.calendar.messages.agenda', 'Agenda'),
      noEventsInRange: t('bookings.calendar.messages.noEvents', 'No bookings in this range.'),
      showMore: (total) => t('bookings.calendar.messages.showMore', '+{{count}} more', { count: total }),
    }),
    [t]
  );

  const calendarFormats = useMemo(
    () => ({
      timeGutterFormat: (date) => format(date, 'HH:mm', { locale: locales[culture] }),
      eventTimeRangeFormat: () => '', // Hide default time display
    }),
    [culture]
  );

  // Custom event wrapper to handle overlapping events
  const CustomEventWrapper = ({ children, ...props }) => {
    if (view === Views.MONTH) {
      return React.cloneElement(React.Children.only(children), {
        ...props,
        isCompact: true,
      });
    }
    return children;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <Calendar
        culture={culture}
        localizer={localizer}
        events={events}
        view={view}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        date={currentDate}
        onView={setView}
        onNavigate={setCurrentDate}
        startAccessor="start"
        endAccessor="end"
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        resources={resources}
        min={minTime}
        max={maxTime}
        step={15}
        timeslots={2}
        selectable={false}
        tooltipAccessor={null}
        defaultView={Views.WEEK}
        rtl={isRTL}
        messages={messages}
        formats={calendarFormats}
        onSelectEvent={handleSelectEvent}
        components={{
          event: (props) => <BookingEvent {...props} culture={culture} />,
          week: {
            event: (props) => <BookingEvent {...props} culture={culture} />,
          },
          day: {
            event: (props) => <BookingEvent {...props} culture={culture} />,
          },
          toolbar: (props) => (
            <CalendarToolbar
              {...props}
              culture={culture}
              isRTL={isRTL}
              t={t}
            />
          ),
        }}
        eventPropGetter={eventPropGetter}
        className="h-[800px] font-sans"
      />

      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">
              {t('bookings.calendar.loading', 'Loading bookings...')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;