import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import { useOwnerContacts } from "../../hooks/owner/useContacts";
import { useToast } from "../../components/ui/useToast";

const FALLBACK_STATUSES = ["new", "pending", "responded", "resolved", "closed"];

const formatStatusLabel = (value) => {
  if (!value) return "";
  return value
    .replace(/[_\s]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (dateValue) => {
  if (!dateValue) return "";
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return dateValue;
  }
};

const ContactsPage = () => {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  const {
    contacts,
    filters,
    pagination,
    loading,
    error,
    refresh,
    setPage,
    setLimit,
    setStatusFilter,
    setSearchFilter,
    updateContactStatus,
  } = useOwnerContacts();

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  const statusOptions = useMemo(() => {
    const seen = new Set();
    const list = [];

    const addStatus = (value) => {
      if (!value) return;
      const key = value.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push(value);
    };

    FALLBACK_STATUSES.forEach(addStatus);
    contacts.forEach((contact) => addStatus(contact.status));
    return list;
  }, [contacts]);

  const statusSummary = useMemo(() => {
    const counts = {
      new: 0,
      responded: 0,
      other: 0,
    };

    contacts.forEach((contact) => {
      const value = (contact.status || "").toLowerCase();

      if (["new", "pending", "open", "unread"].some((term) => value.includes(term))) {
        counts.new += 1;
        return;
      }

      if (
        ["responded", "resolved", "closed", "done", "handled"].some((term) =>
          value.includes(term)
        )
      ) {
        counts.responded += 1;
        return;
      }

      counts.other += 1;
    });

    return counts;
  }, [contacts]);

  const heroHighlights = useMemo(() => {
    const total = pagination.total || contacts.length;
    return [
      {
        label: t("contacts.stats.total", "Total messages"),
        value: total,
        hint: t("contacts.stats.totalHint", "All received inquiries"),
      },
      {
        label: t("contacts.stats.new", "New"),
        value: statusSummary.new,
        hint: t("contacts.stats.newHint", "Awaiting review"),
      },
      {
        label: t("contacts.stats.responded", "Responded"),
        value: statusSummary.responded,
        hint: t("contacts.stats.respondedHint", "Already handled"),
      },
      {
        label: t("contacts.stats.other", "Needs attention"),
        value: statusSummary.other,
        hint: t("contacts.stats.otherHint", "Requires triage"),
      },
    ];
  }, [statusSummary, pagination.total, contacts.length, t]);

  const totalCount = pagination.total || contacts.length;
  const pageSize = pagination.limit || 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = totalCount === 0 ? 0 : (pagination.page - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + contacts.length - 1, totalCount || contacts.length);

  const disabledPrevious = pagination.page <= 1 || loading;
  const disabledNext = pagination.page >= totalPages || loading;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchFilter(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchFilter("");
  };

  const handleLimitChange = (event) => {
    const requestedLimit = Number(event.target.value) || 10;
    setLimit(requestedLimit);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleStatusChange = async (contactId, newStatus) => {
    setStatusUpdatingId(contactId);
    const result = await updateContactStatus(contactId, newStatus);
    setStatusUpdatingId(null);

    if (result?.ok) {
      pushToast({
        type: "success",
        title: t("contacts.toast.statusUpdated", "Status updated"),
        desc: t("contacts.toast.statusUpdatedHint", "The message status was saved."),
      });
      return;
    }

    pushToast({
      type: "error",
      title: t("contacts.toast.updateFailed", "Update failed"),
      desc: result?.error || t("contacts.toast.updateFailedHint", "Please try again."),
    });
  };

  return (
    <section className="space-y-6 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardHeroHeader
          tagLabel={t("contacts.tag", "Client Inbox")}
          title={t("contacts.title", "Contact Messages")}
          description={t(
            "contacts.subtitle",
            "Review recent inquiries and respond to customers who reached out."
          )}
          highlights={heroHighlights}
          actions={
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M4 4v5h.582m15.301 2a8.25 8.25 0 11-3.281-5.263" strokeLinecap="round" />
              </svg>
              {t("common.refresh", "Refresh")}
            </button>
          }
        />

        <section className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-slate-900/5">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t("contacts.filters.searchLabel", "Search messages")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#E39B34] focus:outline-none"
                  placeholder={t(
                    "contacts.filters.searchPlaceholder",
                    "Name or message…"
                  )}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#E39B34] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                >
                  {t("common.search", "Search")}
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                >
                  {t("common.clear", "Clear")}
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t("contacts.filters.statusLabel", "Filter by status")}
                </label>
                <select
                  value={filters.status}
                  onChange={handleStatusFilterChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#E39B34] focus:outline-none"
                  disabled={loading}
                >
                  <option value="">{t("contacts.filters.statusAny", "Any status")}</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {t("contacts.filters.limitLabel", "Items per page")}
                </label>
                <select
                  value={filters.limit}
                  onChange={handleLimitChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-[#E39B34] focus:outline-none"
                >
                  {[10, 20, 50].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#E39B34] hover:text-[#E39B34] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t("contacts.actions.refresh", "Refresh list")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5">
          {loading && (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="relative inline-flex h-12 w-12 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
                  {t("common.loadingShort", "LO")}
                </span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && contacts.length === 0 && (
            <div className="p-6 text-sm text-slate-500">
              {t(
                "contacts.list.empty",
                "There are no messages yet. New client requests will appear here."
              )}
            </div>
          )}

          {!loading && contacts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.3em] text-slate-500">
                    <th className="px-4 py-3 w-[18%]">{t("contacts.table.name", "Customer")}</th>
                    <th className="px-4 py-3 w-[20%] hidden sm:table-cell">
                      {t("contacts.table.contactInfo", "Contact")}
                    </th>
                    <th className="px-4 py-3">{t("contacts.table.message", "Message")}</th>
                    <th className="px-4 py-3 w-[16%]">{t("contacts.table.status", "Status")}</th>
                    <th className="px-4 py-3 w-[16%]">{t("contacts.table.received", "Received")}</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-5 align-top">
                        <p className="text-sm font-semibold text-slate-900">
                          {contact.name || t("common.notAvailable", "Not available")}
                        </p>
                        {contact.email && (
                          <p className="text-xs text-slate-500">{contact.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-5 align-top hidden sm:table-cell">
                        <p className="text-xs text-slate-500">{contact.phone || "-"}</p>
                      </td>
                      <td className="px-4 py-5 align-top">
                        <div className="text-sm leading-relaxed text-slate-700 break-words whitespace-pre-line max-w-full max-h-40 overflow-auto">
                          {contact.message || t("common.notProvided", "Not provided")}
                        </div>
                      </td>
                      <td className="px-4 py-5 align-top">
                        <select
                          value={contact.status || ""}
                          onChange={(event) => handleStatusChange(contact.id, event.target.value)}
                          disabled={statusUpdatingId === contact.id}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow-sm focus:border-[#E39B34] focus:outline-none"
                        >
                          <option value="">{t("contacts.table.statusPlaceholder", "Set status")}</option>
                          {statusOptions.map((status) => (
                            <option key={`${contact.id}-${status}`} value={status}>
                              {formatStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-5 align-top">
                        <p className="text-xs text-slate-500">{formatDate(contact.created_at)}</p>
                        {contact.updated_at && (
                          <p className="text-[11px] text-slate-400">
                            {t("contacts.table.updatedAt", "Updated")} {formatDate(contact.updated_at)}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && contacts.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <p>
                {t(
                  "contacts.pagination.summary",
                  "Showing {{start}}–{{end}} of {{total}}",
                  { start: startIndex, end: endIndex || startIndex, total: totalCount }
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, pagination.page - 1))}
                  disabled={disabledPrevious}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-[#E39B34] hover:text-[#E39B34] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("contacts.pagination.previous", "Previous")}
                </button>
                <span className="text-xs">
                  {t("contacts.pagination.page", "Page")} {pagination.page} {t("contacts.pagination.of", "of")} {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(totalPages, pagination.page + 1))}
                  disabled={disabledNext}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-[#E39B34] hover:text-[#E39B34] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("contacts.pagination.next", "Next")}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default ContactsPage;
