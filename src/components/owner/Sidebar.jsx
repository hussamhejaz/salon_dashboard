import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* brand color */
const BRAND = "#E39B34";

/* --- nicer custom icons (outline + accent) --- */
const Icon = {
  Menu: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" strokeLinecap="round" />
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
    </svg>
  ),

  Dashboard: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      {/* accent dot */}
      <circle cx="17" cy="5.5" r="1.2" fill={BRAND} stroke="none" />
    </svg>
  ),

  Calendar: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <line x1="8" y1="2.5" x2="8" y2="6" strokeLinecap="round" />
      <line x1="16" y1="2.5" x2="16" y2="6" strokeLinecap="round" />
      <line x1="3" y1="9" x2="21" y2="9" />
      {/* check badge */}
      <circle cx="17.5" cy="14.5" r="3.2" fill={BRAND} stroke="none" />
      <path
        d="M16.4 14.5l1 1 1.9-2"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  Home: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
      {/* accent dot on door */}
      <circle cx="12" cy="12" r="1.5" fill={BRAND} stroke="none" />
    </svg>
  ),

  Scissors: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="7" cy="8" r="3" />
      <circle cx="7" cy="16" r="3" />
      <path d="M21 5L11 13" strokeLinecap="round" />
      <path d="M21 19L11 11" strokeLinecap="round" />
      {/* accent handle highlight */}
      <circle cx="7" cy="8" r="1.3" fill={BRAND} stroke="none" />
    </svg>
  ),

  Users: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path
        d="M5 19c.6-2.8 3.5-4.5 7-4.5s6.4 1.7 7 4.5"
        strokeLinecap="round"
      />
      {/* accent mini user */}
      <circle cx="5.5" cy="10.5" r="2" fill={BRAND} stroke="none" />
    </svg>
  ),

  Tag: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M20.3 13.3l-7-7A2 2 0 0 0 12.2 6H5a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l6.9-6.9a2 2 0 0 0 0-2.8z"
        strokeLinejoin="round"
      />
      {/* % badge */}
      <circle cx="8.5" cy="9.5" r="1.5" fill={BRAND} stroke="none" />
      <circle cx="12" cy="13" r="1.5" fill={BRAND} stroke="none" />
      <path
        d="M9.5 12.5l1-1"
        stroke={BRAND}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),

  Star: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.9L12 17.8 6.8 19.3l1-5.9L3.5 9.2l5.9-.9L12 3z"
        strokeLinejoin="round"
      />
      <path
        d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.9L12 17.8"
        fill={BRAND}
        stroke="none"
      />
    </svg>
  ),

  Settings: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6V22a2 2 0 1 1-4 0v-.1a1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1H2a2 2 0 1 1 0-4h.1a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1A2 2 0 1 1 6 3.4l.1.1a1.8 1.8 0 0 0 2 .4H8.2A1.8 1.8 0 0 0 9.2 2h.1a2 2 0 1 1 4 0v.1a1.8 1.8 0 0 0 1 1.6h.1a1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2v.1a1.8 1.8 0 0 0 1.6 1H22a2 2 0 1 1 0 4h-.1a1.8 1.8 0 0 0-1.6 1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* accent dot */}
      <circle cx="12" cy="12" r="1.5" fill={BRAND} stroke="none" />
    </svg>
  ),

  User: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path
        d="M5 20c.9-3.1 3.9-5 7-5s6.1 1.9 7 5"
        strokeLinecap="round"
      />
      {/* badge */}
      <circle cx="18" cy="6" r="2.5" fill={BRAND} stroke="none" />
    </svg>
  ),

  ChevronDown: ({ className = "h-4 w-4" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  ),

  Globe: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z" />
      <circle cx="18" cy="6" r="2" fill={BRAND} stroke="none" />
    </svg>
  ),

  Logout: ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" strokeLinecap="round" />
      <path d="M10 17l5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12H3" strokeLinecap="round" />
      <circle cx="15" cy="12" r="2" fill={BRAND} stroke="none" />
    </svg>
  ),
};
/* --- end icons --- */

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  function toggleLanguage() {
    i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
  }

  function handleSignOut() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentUser");
    try {
      navigate("/login");
    } catch {
      window.location.assign("/login");
    }
    setTimeout(() => {
      if (!/\/login$/.test(window.location.pathname)) {
        window.location.assign("/");
      }
    }, 50);
  }

  const menuItems = [
    {
      key: "sidebar.dashboard",
      icon: Icon.Dashboard,
      sub: [{ key: "sidebar.overview", path: "/dashboard" }],
    },
    {
      key: "sidebar.salonAppointments",
      icon: Icon.Calendar,
      sub: [
        { key: "sidebar.allAppointments", path: "/dashboard/booking" },
        { key: "sidebar.newAppointment", path: "/dashboard/appointments/new" },
      ],
    },
    {
      key: "sidebar.homeServiceAppointments",
      icon: Icon.Home,
      sub: [
        { key: "sidebar.homeServiceBookings", path: "/dashboard/home-service-bookings" },
        { key: "sidebar.newHomeServiceBooking", path: "/dashboard/home-service-bookings/create" },
      ],
    },
    {
      key: "sidebar.services",
      icon: Icon.Scissors,
      sub: [
        { key: "sidebar.newService", path: "/dashboard/services/home-services" },
        { key: "sidebar.categories", path: "/dashboard/services/categories" },
      ],
    },
    // {
    //   key: "sidebar.staff",
    //   icon: Icon.Users,
    //   sub: [
    //     { key: "sidebar.staffList", path: "/dashboard/staff" },
    //     { key: "sidebar.addStaff", path: "/dashboard/staff/new" },
    //     { key: "sidebar.schedule", path: "/dashboard/staff/schedule" },
    //   ],
    // },
    {
      key: "sidebar.pricingOffers",
      icon: Icon.Tag,
      sub: [
        { key: "sidebar.pricing", path: "/dashboard/pricing" },
        { key: "sidebar.offers", path: "/dashboard/offers" },
      ],
    },
    {
      key: "sidebar.reviews",
      icon: Icon.Star,
      sub: [
        { key: "sidebar.allReviews", path: "/dashboard/reviews" },
        { key: "sidebar.featuredReviews", path: "/dashboard/reviews/featured" },
      ],
    },
    {
      key: "sidebar.settings",
      icon: Icon.Settings,
      sub: [
        // { key: "sidebar.salonProfile", path: "/dashboard/settings/salon" },
        { key: "sidebar.businessHours", path: "/dashboard/settings/hours" },
        // { key: "sidebar.availability", path: "/dashboard/availability-manager" },
        // { key: "sidebar.integration", path: "/dashboard/settings/integration" },
      ],
    },
    {
      key: "sidebar.account",
      icon: Icon.User,
      sub: [
        { key: "sidebar.myProfile", path: "/dashboard/account/profile" },
        { key: "sidebar.notifications", path: "/dashboard/account/notifications" },
        { key: "sidebar.languageToggle", action: toggleLanguage, icon: Icon.Globe },
        { key: "sidebar.signout", action: handleSignOut, icon: Icon.Logout },
      ],
    },
  ];

  function toggleMenu(key) {
    setActiveMenu((prev) => (prev === key ? "" : key));
  }

  return (
    <aside
      className={`flex h-screen flex-col bg-white text-gray-800 shadow-lg transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            className={`rounded-full p-2 transition-transform duration-300 focus:outline-none ${
              isOpen ? "rotate-0" : "rotate-180"
            }`}
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) setActiveMenu("");
            }}
            aria-label={isOpen ? t("sidebar.collapse") : t("sidebar.expand")}
          >
            <Icon.Menu className="h-5 w-5 text-slate-700" />
          </button>

          {isOpen && (
            <span className="truncate text-left font-bold text-lg text-slate-900 rtl:text-right">
              {t("brand.name", { defaultValue: "Salon Admin" })}
            </span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const open = activeMenu === item.key;
          const ItemIcon = item.icon;
          return (
            <div key={item.key} className="mb-1">
              <button
                type="button"
                onClick={() => toggleMenu(item.key)}
                className={`flex w-full items-center justify-between rounded-r-lg px-5 py-3 text-sm transition-all duration-200 ${
                  open
                    ? "border-l-4 border-[#E39B34] bg-[#fff8f0] text-[#E39B34] font-medium"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon
                    className={`h-5 w-5 ${
                      open ? "text-[#E39B34]" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />
                  {isOpen && (
                    <span className="text-left font-medium rtl:text-right">
                      {t(item.key)}
                    </span>
                  )}
                </div>

                {isOpen && (
                  <Icon.ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      open ? "rotate-180 text-[#E39B34]" : "text-slate-400"
                    }`}
                  />
                )}
              </button>

              {isOpen && open && (
                <div className="space-y-1 pb-3 pl-12 pr-4 rtl:pl-0 rtl:pr-12">
                  {item.sub.map((sub) => {
                    const isAction = !sub.path && sub.action;
                    const ActiveIcon = sub.icon;

                    if (isAction) {
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={sub.action}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 text-left rtl:text-right"
                        >
                          {ActiveIcon && (
                            <ActiveIcon className="h-5 w-5 text-slate-500" />
                          )}
                          {t(sub.key)}
                        </button>
                      );
                    }

                    const activeChild = location.pathname === sub.path;
                    return (
                      <Link
                        key={sub.key}
                        to={sub.path}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-left rtl:text-right ${
                          activeChild
                            ? "bg-[#E39B34] text-white"
                            : "text-slate-700 hover:bg-[#fff8f0] hover:text-[#E39B34]"
                        }`}
                      >
                        {ActiveIcon && (
                          <ActiveIcon
                            className={`h-5 w-5 ${
                              activeChild
                                ? "text-white"
                                : "text-slate-500 group-hover:text-[#E39B34]"
                            }`}
                          />
                        )}
                        {t(sub.key)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="border-t p-4 text-center text-xs text-slate-500">
          {t("footer.rights", { defaultValue: "All rights reserved." })}
        </div>
      )}
    </aside>
  );
}
