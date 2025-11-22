import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useOwnerDashboardSummary } from "../../hooks/owner/useOwnerDashboardSummary";
import RiyalIcon from "../../components/RiyalIcon";

const BRAND = "#E39B34";
const TINT = "rgba(227,155,52,0.12)";

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  const { salon, metrics, lists, charts, loading, error, refetch } = useOwnerDashboardSummary();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === "rtl";
  const arrow = isRTL ? "←" : "→";
  const locale = i18n.language === "ar" ? "ar-SA" : "en-GB";

  const numberFormatter = new Intl.NumberFormat(locale);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const formatArrowLabel = (label) => (isRTL ? `${arrow} ${label}` : `${label} ${arrow}`);
  const formatNumber = (value) =>
    value === undefined || value === null ? "—" : numberFormatter.format(value);
  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return dateFormatter.format(parsed);
  };
  const formatTime = (value) => {
    if (!value) return "—";
    const parsed = new Date(`1970-01-01T${value}`);
    if (Number.isNaN(parsed.getTime())) return value;
    return timeFormatter.format(parsed);
  };
  const formatDateTime = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return dateTimeFormatter.format(parsed);
  };
  const renderCurrency = (value, size = 14) => {
    if (value === undefined || value === null) return "—";
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "—";
    return (
      <span className="inline-flex items-center gap-1">
        <RiyalIcon size={size} />
        {numberFormatter.format(Math.round(numeric))}
      </span>
    );
  };

  const chartSeries = charts?.bookingsDaily || [];

  const combinedBookings = useMemo(() => {
    const salonBookings =
      (lists?.recentBookings || []).map((item) => ({
        ...item,
        bookingType: "salon",
      })) || [];
    const homeBookings =
      (lists?.recentHomeServiceBookings || []).map((item) => ({
        ...item,
        bookingType: "home",
      })) || [];

    return [...salonBookings, ...homeBookings]
      .sort((a, b) => {
        const dateA = new Date(`${a.booking_date}T${a.booking_time || "00:00"}`);
        const dateB = new Date(`${b.booking_date}T${b.booking_time || "00:00"}`);
        return dateB - dateA;
      })
      .slice(0, 8);
  }, [lists]);

  const notifications = lists?.latestNotifications || [];

  const todaysChart = chartSeries.at(-1) || null;
  const previousChart = chartSeries.length > 1 ? chartSeries[chartSeries.length - 2] : null;
  const todaysTotal = todaysChart ? todaysChart.salon + todaysChart.home : 0;
  const previousTotal = previousChart ? previousChart.salon + previousChart.home : 0;
  const delta = todaysTotal - previousTotal;
  const percentChange = previousTotal
    ? Math.round((Math.abs(delta) / previousTotal) * 100)
    : todaysTotal
    ? 100
    : 0;
  const changeSign = delta > 0 ? "+" : delta < 0 ? "-" : "±";
  const homeShareToday = todaysTotal ? Math.round((todaysChart.home / todaysTotal) * 100) : 0;

  const totalRangeSalon = chartSeries.reduce((sum, day) => sum + day.salon, 0);
  const totalRangeHome = chartSeries.reduce((sum, day) => sum + day.home, 0);
  const totalRange = totalRangeSalon + totalRangeHome;
  const salonSharePercent = totalRange ? Math.round((totalRangeSalon / totalRange) * 100) : 0;
  const homeSharePercentRange = totalRange ? Math.round((totalRangeHome / totalRange) * 100) : 0;
  const totalBookingsBase = (metrics.totalBookings || 0) + (metrics.totalHomeServiceBookings || 0);
  const cancellationsPercent = totalBookingsBase
    ? Math.round(((metrics.cancelledBookings || 0) / totalBookingsBase) * 100)
    : 0;

  const progressStats = [
    {
      id: "salonShare",
      label: t("dashboardHome.performance.stats.salonShare"),
      value: salonSharePercent,
      helper: t("dashboardHome.performance.helpers.salonShare", {
        count: formatNumber(totalRangeSalon),
      }),
    },
    {
      id: "homeShare",
      label: t("dashboardHome.performance.stats.homeShare"),
      value: homeSharePercentRange,
      helper: t("dashboardHome.performance.helpers.homeShare", {
        count: formatNumber(totalRangeHome),
      }),
    },
    {
      id: "cancellations",
      label: t("dashboardHome.performance.stats.cancellations"),
      value: cancellationsPercent,
      helper: t("dashboardHome.performance.helpers.cancellations", {
        count: formatNumber(metrics.cancelledBookings || 0),
      }),
    },
  ];

  const peakDay = chartSeries.reduce(
    (acc, day) => {
      const total = day.salon + day.home;
      return total > acc.total ? { ...day, total } : acc;
    },
    { total: -Infinity }
  );
  const peakLabel = peakDay.total >= 0 ? formatDate(peakDay.date) : "";

  const insights = [
    {
      id: "trend",
      tone: delta >= 0 ? "positive" : "warning",
      label: t("dashboardHome.insights.items.trend.label"),
      text: t("dashboardHome.insights.items.trend.text", {
        total: formatNumber(todaysTotal),
        sign: changeSign === "±" ? "" : changeSign,
        percent: percentChange,
      }),
    },
    peakDay.total >= 0 && {
      id: "peak",
      tone: "brand",
      label: t("dashboardHome.insights.items.peak.label"),
      text: t("dashboardHome.insights.items.peak.text", {
        day: peakLabel,
        total: formatNumber(peakDay.total),
      }),
    },
    todaysTotal
      ? {
          id: "homeShare",
          tone: "neutral",
          label: t("dashboardHome.insights.items.homeShare.label"),
          text: t("dashboardHome.insights.items.homeShare.text", {
            percent: homeShareToday,
          }),
        }
      : null,
  ].filter(Boolean);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-700">
          <span>{t("dashboardHome.errors.loadFailed")}</span>
          <button
            onClick={refetch}
            className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-white"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      <header className="rounded-3xl border border-slate-100/80 bg-gradient-to-r from-[#fff7ec] via-white to-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {t("dashboard.headerTitle")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {t("dashboardHome.hero.greeting", {
                salon: salon?.name || t("dashboardHome.hero.defaultSalon"),
              })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              {t("dashboardHome.hero.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard/appointments/new")}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              {t("dashboardHome.hero.actions.book")}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              id: "today",
              label: t("dashboardHome.hero.stats.today.label"),
              value: formatNumber(metrics.todaysBookings),
              helper: t("dashboardHome.hero.stats.today.helper"),
            },
            {
              id: "home",
              label: t("dashboardHome.hero.stats.home.label"),
              value: formatNumber(metrics.todaysHomeServiceBookings),
              helper: t("dashboardHome.hero.stats.home.helper"),
            },
            {
              id: "revenue",
              label: t("dashboardHome.hero.stats.revenue.label"),
              value: renderCurrency(metrics.monthlyRevenue, 18),
              helper: t("dashboardHome.hero.stats.revenue.helper"),
            },
          ].map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-inner shadow-white/30 backdrop-blur-sm"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.helper}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            id: "totalBookings",
            label: t("dashboardHome.metrics.total.label"),
            value: formatNumber(metrics.totalBookings),
            helper: t("dashboardHome.metrics.total.helper"),
            pill: t("dashboardHome.metrics.total.pill", {
              value: formatNumber(metrics.todaysBookings),
            }),
            tone: "positive",
          },
          {
            id: "homeBookings",
            label: t("dashboardHome.metrics.homeVisits.label"),
            value: formatNumber(metrics.totalHomeServiceBookings),
            helper: t("dashboardHome.metrics.homeVisits.helper"),
            pill: t("dashboardHome.metrics.homeVisits.pill", {
              value: formatNumber(metrics.todaysHomeServiceBookings),
            }),
            tone: "brand",
          },
          {
            id: "offers",
            label: t("dashboardHome.metrics.offers.label"),
            value: formatNumber(metrics.activeOffers),
            helper: t("dashboardHome.metrics.offers.helper"),
            pill: t("dashboardHome.metrics.offers.pill", {
              value: formatNumber((metrics.totalServices || 0) + (metrics.totalHomeServices || 0)),
            }),
            tone: "warning",
          },
          {
            id: "alerts",
            label: t("dashboardHome.metrics.alerts.label"),
            value: formatNumber(metrics.unreadNotifications),
            helper: t("dashboardHome.metrics.alerts.helper"),
            pill: t("dashboardHome.metrics.alerts.pill"),
            tone: "neutral",
          },
        ].map((metric) => (
          <div
            key={metric.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_12px_45px_rgba(15,23,42,0.06)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(227,155,52,0.25)] bg-[rgba(227,155,52,0.08)]">
                <span className="h-3 w-3 rounded-full bg-gradient-to-br from-[#E39B34] to-[#b86a14]" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{metric.helper}</span>
              {metric.pill && <Pill tone={metric.tone}>{metric.pill}</Pill>}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t("dashboardHome.performance.title")}
              </p>
              <p className="text-xs text-slate-500">{t("dashboardHome.performance.subtitle")}</p>
            </div>
            <button className="text-xs font-medium text-slate-500 hover:text-slate-800">
              {formatArrowLabel(t("dashboardHome.performance.cta"))}
            </button>
          </div>
          <div className="mt-4">
            <BookingsChart
              data={chartSeries}
              t={t}
              formatNumber={formatNumber}
              formatDate={formatDate}
              renderCurrency={renderCurrency}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {progressStats.map((stat) => (
              <div key={stat.id}>
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{stat.label}</span>
                  <span>{stat.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${stat.value}%`,
                      background: `linear-gradient(90deg, ${TINT}, ${BRAND})`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-400">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {t("dashboardHome.insights.title")}
            </p>
            <Pill tone="brand">{t("dashboardHome.insights.badge")}</Pill>
          </div>
          <div className="mt-4 space-y-4">
            {insights.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-slate-700">{item.text}</p>
                <div className="mt-3">
                  <Pill tone={item.tone}>{t("dashboardHome.insights.action")}</Pill>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl border border-dashed border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300">
            {t("dashboardHome.insights.share")}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t("dashboardHome.bookings.title")}
              </p>
              <p className="text-xs text-slate-500">{t("dashboardHome.bookings.subtitle")}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/booking")}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {formatArrowLabel(t("dashboardHome.bookings.cta"))}
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className={`min-w-full ${isRTL ? "text-right" : "text-left"} text-sm`}>
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.client")}</th>
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.service")}</th>
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.date")}</th>
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.time")}</th>
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.total")}</th>
                  <th className="py-3 pr-4 font-semibold">{t("dashboardHome.bookings.columns.status")}</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {combinedBookings.length === 0 && (
                  <tr>
                    <td className="py-6 text-center text-sm text-slate-400" colSpan={6}>
                      {t("dashboardHome.bookings.empty")}
                    </td>
                  </tr>
                )}
                {combinedBookings.map((booking) => {
                  const serviceName =
                    booking.services?.name ||
                    booking.home_services?.name ||
                    t("dashboardHome.bookings.unknownService");
                  return (
                    <tr key={`${booking.bookingType}-${booking.id}`} className="border-t border-slate-100">
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {booking.customer_name || t("common.notProvided")}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{serviceName}</span>
                          <Pill tone={booking.bookingType === "home" ? "brand" : "neutral"}>
                            {booking.bookingType === "home"
                              ? t("dashboardHome.bookings.type.home")
                              : t("dashboardHome.bookings.type.salon")}
                          </Pill>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{formatDate(booking.booking_date)}</td>
                      <td className="py-3 pr-4">{formatTime(booking.booking_time)}</td>
                      <td className="py-3 pr-4">{renderCurrency(booking.total_price)}</td>
                      <td className="py-3 pr-4">
                        <StatusPill status={booking.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t("dashboardHome.notifications.title")}
              </p>
              <p className="text-xs text-slate-500">{t("dashboardHome.notifications.subtitle")}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/account/notifications")}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              {formatArrowLabel(t("dashboardHome.notifications.cta"))}
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {notifications.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
                {t("dashboardHome.notifications.empty")}
              </div>
            )}

            {notifications.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-100 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{note.title}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(note.created_at)}</p>
                  </div>
                  <Pill tone={getNotificationTone(note.type)}>
                    {t(`dashboardHome.notifications.types.${note.type}`, {
                      defaultValue: note.type,
                    })}
                  </Pill>
                </div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{note.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ tone = "brand", children }) {
  const palette = {
    positive: {
      bg: "rgba(16,185,129,0.14)",
      color: "#047857",
    },
    brand: {
      bg: TINT,
      color: BRAND,
    },
    warning: {
      bg: "rgba(251,191,36,0.2)",
      color: "#92400e",
    },
    neutral: {
      bg: "rgba(148,163,184,0.2)",
      color: "#475569",
    },
  };

  const style = palette[tone] || palette.brand;

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {children}
    </span>
  );
}

function BookingsChart({ data, t, formatNumber, formatDate, renderCurrency }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        {t("dashboardHome.bookings.empty")}
      </div>
    );
  }

  const width = 400;
  const height = 160;
  const padding = 16;
  const totals = data.map((day) => day.salon + day.home);
  const maxValue = Math.max(...totals, 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((day, idx) => {
    const total = totals[idx];
    const x = padding + idx * step;
    const y = height - padding - (total / maxValue) * (height - padding * 2);
    return { x, y };
  });

  const path = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const totalRevenue = data.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalBookings = totals.reduce((sum, value) => sum + value, 0);
  const recentSlice = data.slice(-4);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
        <defs>
          <linearGradient id="trendArea" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={TINT} stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendArea)" />
        <path d={path} fill="none" stroke={BRAND} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="mt-4 grid gap-4 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <p>{t("dashboardHome.performance.totalBookingsLabel")}</p>
          <p className="text-base font-semibold text-slate-900">{formatNumber(totalBookings)}</p>
        </div>
        <div>
          <p>{t("dashboardHome.performance.revenueLabel")}</p>
          <p className="text-base font-semibold text-slate-900">{renderCurrency(totalRevenue)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-4">
        {recentSlice.map((day) => (
          <div key={day.date} className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-900">{formatDate(day.date)}</p>
            <p className="mt-1 text-slate-600">
              {formatNumber(day.salon + day.home)} {t("dashboardHome.bookings.columns.total")}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatNumber(day.salon)} · {t("dashboardHome.bookings.type.salon")}
            </p>
            <p className="text-[11px] text-slate-500">
              {formatNumber(day.home)} · {t("dashboardHome.bookings.type.home")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const { t } = useTranslation();
  const map = {
    confirmed: {
      textKey: "dashboardHome.status.confirmed",
      bg: "rgba(16,185,129,0.12)",
      color: "#065f46",
    },
    pending: {
      textKey: "dashboardHome.status.pending",
      bg: "rgba(59,130,246,0.14)",
      color: "#1d4ed8",
    },
    new: {
      textKey: "dashboardHome.status.new",
      bg: TINT,
      color: "#a15f11",
    },
    waiting: {
      textKey: "dashboardHome.status.waiting",
      bg: "rgba(251,191,36,0.15)",
      color: "#92400e",
    },
    done: {
      textKey: "dashboardHome.status.done",
      bg: "rgba(107,114,128,0.12)",
      color: "#374151",
    },
    completed: {
      textKey: "dashboardHome.status.completed",
      bg: "rgba(16,185,129,0.12)",
      color: "#065f46",
    },
    canceled: {
      textKey: "dashboardHome.status.canceled",
      bg: "rgba(248,113,113,0.12)",
      color: "#7f1d1d",
    },
    cancelled: {
      textKey: "dashboardHome.status.canceled",
      bg: "rgba(248,113,113,0.12)",
      color: "#7f1d1d",
    },
  };

  const style = map[status] || map.waiting;

  return (
    <span
      className="inline-flex rounded-md px-2 py-1 text-[11px] font-medium"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {t(style.textKey)}
    </span>
  );
}

function getNotificationTone(type) {
  switch (type) {
    case "success":
    case "booking":
      return "positive";
    case "alert":
    case "warning":
      return "warning";
    case "info":
    default:
      return "brand";
  }
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-100/80 bg-white p-6 shadow animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-6 w-2/3 rounded-full bg-slate-200" />
          <div className="h-4 w-full rounded-full bg-slate-100" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((key) => (
            <div key={key} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-inner">
              <div className="h-3 w-20 rounded-full bg-slate-100" />
              <div className="mt-3 h-6 w-24 rounded-full bg-slate-200" />
              <div className="mt-2 h-3 w-16 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow animate-pulse">
            <div className="h-3 w-24 rounded-full bg-slate-100" />
            <div className="mt-3 h-8 w-28 rounded-full bg-slate-200" />
            <div className="mt-4 h-3 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow animate-pulse">
        <div className="h-4 w-32 rounded-full bg-slate-100" />
        <div className="mt-4 h-40 rounded-2xl bg-slate-100" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {[1, 2].map((key) => (
          <div key={key} className="rounded-2xl border border-slate-100 bg-white p-5 shadow animate-pulse">
            <div className="h-4 w-40 rounded-full bg-slate-100" />
            <div className="mt-6 space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-6 w-full rounded-full bg-slate-100" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
