import React, { useMemo } from 'react';
import { differenceInMinutes, format, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns';
import arSA from 'date-fns/locale/ar-SA';
import enUS from 'date-fns/locale/en-US';

import BookingEventCard from './BookingEventCard';

const locales = {
  'ar-SA': arSA,
  'en-US': enUS,
};

const HOUR_HEIGHT = 64;

// Simple greedy lane assignment so overlapping events share available width.
const assignLanes = (events) => {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const laneEndTimes = [];
  let maxLanes = 0;

  const placed = sorted.map((event) => {
    let laneIndex = 0;
    for (; laneIndex < laneEndTimes.length; laneIndex++) {
      if (event.start >= laneEndTimes[laneIndex]) {
        break;
      }
    }
    if (laneIndex === laneEndTimes.length) {
      laneEndTimes.push(event.end);
    } else {
      laneEndTimes[laneIndex] = event.end;
    }
    maxLanes = Math.max(maxLanes, laneEndTimes.length);
    return { ...event, laneIndex };
  });

  return placed.map((event) => ({ ...event, laneCount: maxLanes || 1 }));
};

const TimeGrid = ({ days, events, culture, isRTL, minTime, maxTime, onSelectBooking }) => {
  const locale = locales[culture] || enUS;
  const minuteHeight = HOUR_HEIGHT / 60;
  const totalMinutes = Math.max(60, differenceInMinutes(maxTime, minTime));
  const gridHeight = totalMinutes * minuteHeight;

  const hours = useMemo(() => {
    const startHour = minTime.getHours();
    const count = Math.floor(totalMinutes / 60) + 1;
    return Array.from({ length: count }, (_, i) => startHour + i);
  }, [minTime, totalMinutes]);
  const intervalHeight = gridHeight / Math.max(hours.length - 1, 1);

  const dayEvents = useMemo(
    () =>
      days.map((day) => {
        const filtered = events.filter((event) => isSameDay(event.start, day));
        return assignLanes(filtered);
      }),
    [days, events]
  );

  const dayHeaderOrder = isRTL ? [...days].reverse() : days;
  const columnsOrder = isRTL ? [...dayEvents].reverse() : dayEvents;
  const columnCount = dayHeaderOrder.length || 1;
  const minWidth = Math.max(720, columnCount * 180);

  return (
    <div className="overflow-x-auto">
      <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`} style={{ minWidth }}>
        <div className="w-20 shrink-0 border-slate-200 text-right text-xs text-slate-500">
          <div className="h-[52px] border-b border-slate-200" />
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((hour, idx) => {
              const timeLabel = format(setMinutes(setHours(new Date(), hour), 0), 'p', { locale });
              const top = idx * intervalHeight;
              return (
                <span
                  key={`${hour}-${idx}`}
                  className="absolute right-2 bg-white px-1 text-[11px] font-semibold text-slate-500"
                  style={{ top: Math.max(0, top - 10) }}
                >
                  {timeLabel}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div
            className="grid border-b border-slate-200 text-sm font-semibold text-slate-800"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {dayHeaderOrder.map((day) => (
              <div
                key={day.toISOString()}
                className="flex h-[52px] items-center justify-between border-slate-200 px-4"
              >
                <div className="space-y-0.5">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {format(day, 'EEE', { locale })}
                  </p>
                  <p className={`text-base font-bold ${isSameDay(day, new Date()) ? 'text-[#E39B34]' : ''}`}>
                    {format(day, 'dd LLL', { locale })}
                  </p>
                </div>
                {isSameDay(day, new Date()) && <span className="h-2 w-2 rounded-full bg-[#E39B34]" />}
              </div>
            ))}
          </div>

          <div className="relative">
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
            >
              {dayHeaderOrder.map((day) => (
                <div
                  key={day.toISOString()}
                  className="border-l border-slate-200 first:border-l-0"
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(226,232,240,0.7) 1px, transparent 1px)',
                    backgroundSize: `100% ${HOUR_HEIGHT}px`,
                  }}
                />
              ))}
            </div>

            <div
              className="grid"
              style={{ height: gridHeight, gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
            >
              {columnsOrder.map((dayEventsWithLanes, columnIndex) => {
                const day = dayHeaderOrder[columnIndex];
                const dayStart = setMinutes(setHours(startOfDay(day), minTime.getHours()), minTime.getMinutes());

                return (
                  <div
                    key={`${day.toISOString()}-${columnIndex}`}
                    className={`relative border-l border-slate-200 bg-white ${isSameDay(day, new Date()) ? 'bg-amber-50/40' : ''}`}
                    style={{
                      backgroundImage: 'linear-gradient(to bottom, rgba(226,232,240,0.7) 1px, transparent 1px)',
                      backgroundSize: `100% ${HOUR_HEIGHT}px`,
                    }}
                  >
                    {dayEventsWithLanes.map((event) => {
                      const minutesFromStart = differenceInMinutes(event.start, dayStart);
                      const durationMinutes = Math.max(15, differenceInMinutes(event.end, event.start));
                      const cappedTop = Math.max(0, minutesFromStart);
                      const availableMinutes = Math.max(0, totalMinutes - cappedTop);
                      const adjustedDuration = Math.max(
                        15,
                        Math.min(availableMinutes, durationMinutes - Math.max(0, -minutesFromStart))
                      );
                      const height = Math.max(38, adjustedDuration * minuteHeight);
                      const top = Math.max(0, cappedTop * minuteHeight);
                      const laneWidth = 100 / (event.laneCount || 1);
                      const horizontalPosition = laneWidth * event.laneIndex;

                      const positionStyle = isRTL
                        ? { right: `${horizontalPosition}%`, width: `calc(${laneWidth}% - 8px)` }
                        : { left: `${horizontalPosition}%`, width: `calc(${laneWidth}% - 8px)` };

                      return (
                        <div
                          key={event.id}
                          className="absolute px-2"
                          style={{
                            top,
                            height,
                            ...positionStyle,
                          }}
                        >
                          <BookingEventCard
                            event={event}
                            culture={culture}
                            onClick={() => onSelectBooking && onSelectBooking(event.booking)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
