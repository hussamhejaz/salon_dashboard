// src/components/ui/BookingStats.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RiyalIcon from '../../RiyalIcon';

const BookingStats = ({ stats = {}, todaysBookings = [], upcomingBookings = [] }) => {
  const { t, i18n } = useTranslation();

  const totalBookings = stats.total_bookings || 0;
  const totalRevenue = stats.total_revenue || 0;
  const todayCount = todaysBookings.length || 0;
  const upcomingCount = upcomingBookings.length || 0;

  const formatNumber = useMemo(
    () => new Intl.NumberFormat(i18n.language || 'en', { maximumFractionDigits: 0 }),
    [i18n.language]
  );

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [i18n.language]
  );

  const statsData = [
    {
      id: 'total',
      title: t('bookings.stats.total', 'Total Bookings'),
      value: formatNumber.format(totalBookings),
      change: t('bookings.stats.totalDesc', 'All bookings'),
      accent: 'from-blue-500/20 to-blue-500/5',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'today',
      title: t('bookings.stats.today', "Today's Bookings"),
      value: formatNumber.format(todayCount),
      change: t('bookings.stats.todayDesc', 'Scheduled for today'),
      accent: 'from-emerald-500/20 to-emerald-500/5',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'upcoming',
      title: t('bookings.stats.upcoming', 'Upcoming Bookings'),
      value: formatNumber.format(upcomingCount),
      change: t('bookings.stats.upcomingDesc', 'Next 7 days'),
      accent: 'from-amber-500/20 to-amber-500/5',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'revenue',
      title: t('bookings.stats.revenue', 'Total Revenue'),
      value: formatCurrency.format(totalRevenue),
      change: t('bookings.stats.revenueDesc', 'Total revenue generated'),
      accent: 'from-purple-500/20 to-purple-500/5',
      icon: <RiyalIcon size={14} />,
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {statsData.map((stat) => (
        <div
          key={stat.id}
          className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className={`rounded-xl bg-gradient-to-br ${stat.accent} p-2 text-slate-700`}>{stat.icon}</div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              {stat.id === 'today' ? 'Live' : 'Summary'}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
          <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
        </div>
      ))}
    </div>
  );
};

export default BookingStats;
