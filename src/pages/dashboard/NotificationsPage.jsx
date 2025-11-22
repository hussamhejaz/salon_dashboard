import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../hooks/owner/useNotifications';
import DashboardHeroHeader from '../../components/dashboard/DashboardHeroHeader';

const severityStyles = {
  info: 'border-blue-100 bg-blue-50 text-blue-700',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-700',
  danger: 'border-rose-100 bg-rose-50 text-rose-700',
};

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { notifications, loading, error, refetch } = useNotifications();

  const totalNotifications = notifications.length;
  const severityCounts = useMemo(() => {
    return Object.keys(severityStyles).reduce((acc, key) => {
      acc[key] = notifications.filter((note) => note.type === key).length;
      return acc;
    }, {});
  }, [notifications]);

  const heroHighlights = useMemo(
    () => [
      {
        label: t('notifications.stats.total', 'Total'),
        value: totalNotifications,
        hint: t('notifications.stats.totalHint', 'All updates'),
      },
      {
        label: t('notifications.stats.info', 'Info'),
        value: severityCounts.info,
        hint: t('notifications.stats.infoHint', 'General updates'),
      },
      {
        label: t('notifications.stats.warning', 'Alerts'),
        value: severityCounts.warning,
        hint: t('notifications.stats.warningHint', 'Requires attention'),
      },
      {
        label: t('notifications.stats.danger', 'Urgent'),
        value: severityCounts.danger,
        hint: t('notifications.stats.dangerHint', 'Critical issues'),
      },
    ],
    [severityCounts, totalNotifications, t],
  );

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t('notifications.tag', 'المستجدات')}
          title={t('notifications.title', 'Notifications')}
          description={t('notifications.subtitle', 'Latest updates related to your bookings and account')}
          highlights={heroHighlights}
          actions={
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 4v5h.582m15.301 2a8.25 8.25 0 11-3.281-5.263" />
              </svg>
              {t('common.refresh', 'Refresh')}
            </button>
          }
        />

        {loading && (
          <div className="min-h-[180px] flex items-center justify-center rounded-3xl border border-white/60 bg-white/85 shadow-sm">
            <div className="relative inline-flex h-12 w-12 items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
                {t('common.loadingShort', 'LO')}
              </span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="rounded-3xl border border-white/60 bg-white/85 px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              {t('notifications.empty', 'No notifications yet. You will find booking updates here.')}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => {
            const severity = severityStyles[notification.type] || severityStyles.info;
            return (
              <div
                key={notification.id}
                className={`rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:shadow-lg ${severity}`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                  {notification.meta && (
                    <p className="text-xs text-slate-500">
                      {notification.meta}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default NotificationsPage;
