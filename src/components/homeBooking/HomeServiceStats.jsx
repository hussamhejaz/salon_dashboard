// src/pages/owner/home-service-bookings/components/HomeServiceStats.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import RiyalIcon from '../RiyalIcon';

const HomeServiceStats = ({ stats = {}, todaysBookings = [], upcomingBookings = [] }) => {
  const { t, i18n } = useTranslation();

  const totalBookings = stats.total_bookings || 0;
  const totalRevenue = stats.total_revenue || 0;
  const travelFees = stats.total_travel_fees || 0;
  const todayCount = todaysBookings.length || 0;
  const upcomingCount = upcomingBookings.length || 0;

  const formatNumber = useMemo(
    () => new Intl.NumberFormat(i18n.language || 'en', { maximumFractionDigits: 0 }),
    [i18n.language]
  );

  const formatCurrency = useMemo(
    () => new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    }),
    [i18n.language]
  );

  const statsData = [
    {
      title: t('homeServiceBookings.stats.total', 'Total Bookings'),
      value: formatNumber.format(totalBookings),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'blue',
      description: t('homeServiceBookings.stats.totalDesc', 'All home service bookings'),
    },
    {
      title: t('homeServiceBookings.stats.today', "Today's Bookings"),
      value: formatNumber.format(todayCount),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      description: t('homeServiceBookings.stats.todayDesc', 'Scheduled for today'),
    },
    {
      title: t('homeServiceBookings.stats.upcoming', 'Upcoming Bookings'),
      value: formatNumber.format(upcomingCount),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'orange',
      description: t('homeServiceBookings.stats.upcomingDesc', 'Future appointments'),
    },
    {
      title: t('homeServiceBookings.stats.revenue', 'Total Revenue'),
      value: formatCurrency.format(totalRevenue),
      icon: <RiyalIcon size={18} />,
      color: 'purple',
      description:
        travelFees > 0
          ? t('homeServiceBookings.stats.revenueWithTravel', 'Including travel fees')
          : t('homeServiceBookings.stats.revenueDesc', 'Total service revenue'),
      additional:
        travelFees > 0 &&
        `${formatCurrency.format(travelFees)} ${t('homeServiceBookings.travelFees', 'travel')}`,
    },
  ];

  const getAccentClasses = (color) => {
    const palette = {
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      green: 'bg-green-50 text-green-700 border-green-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return palette[color] || palette.blue;
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <div
          key={stat.title}
          className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm shadow-slate-900/5 backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.title}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.description}</p>
            </div>
            <div className={`rounded-2xl border p-3 ${getAccentClasses(stat.color)}`}>{stat.icon}</div>
          </div>
          {stat.additional && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {stat.additional}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default HomeServiceStats;
