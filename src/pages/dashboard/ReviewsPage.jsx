import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { useToast } from "../../components/ui/useToast";

import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import { useOwnerReviews, REVIEWS_PAGE_LIMIT } from "../../hooks/owner/useReviews";

const isFeaturedReview = (review) => {
  const metadata = review.metadata || {};
  const candidate =
    metadata.featured ?? metadata.is_featured ?? metadata.isFeatured;

  if (candidate === undefined || candidate === null) {
    return false;
  }

  if (typeof candidate === "boolean") {
    return candidate;
  }

  const normalized = String(candidate).toLowerCase();
  return normalized === "true" || normalized === "1";
};

const ReviewCard = ({
  review,
  locale,
  t,
  featured,
  onToggleFeatured,
  processing,
}) => {
  const ratingValue = Number.isFinite(review.rating) ? review.rating : 0;
  const roundedRating = Math.round(ratingValue * 10) / 10;
  const createdAt = review.created_at ? new Date(review.created_at) : null;
  const formattedDate =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(createdAt)
      : t("common.notProvided");

  const starCount = Math.round(Math.min(Math.max(roundedRating, 0), 5));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2 text-2xl font-semibold text-slate-900">
            <span>{roundedRating.toFixed(1)}</span>
            <span className="text-sm font-normal text-slate-500">/5</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{review.name || t("reviewsPage.card.anonymous")}</span>
            <span>•</span>
            <time dateTime={review.created_at || ""}>{formattedDate}</time>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
          <span
            className={`rounded-full px-3 py-1 text-[10px] ${
              review.is_visible
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {review.is_visible
              ? t("reviewsPage.card.visible")
              : t("reviewsPage.card.hidden")}
          </span>
          {featured && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-semibold text-amber-700">
              {t("reviewsPage.card.featuredBadge")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={`${review.id}-${index}`}
            className={
              index < starCount ? "text-amber-500" : "text-slate-200"
            }
          >
            ★
          </span>
        ))}
        <span className="sr-only">{t("reviewsPage.card.ratingAria")}</span>
      </div>

      <p className="mt-4 min-h-[3rem] text-sm leading-relaxed text-slate-600">
        {review.text || t("reviewsPage.card.noMessage")}
      </p>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-600">
            {t("reviewsPage.card.emailLabel")}:
          </span>
          <span>{review.email || t("common.notProvided")}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-600">
            {t("reviewsPage.card.phoneLabel")}:
          </span>
          <span>{review.phone || t("common.notProvided")}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-600">
            {t("reviewsPage.card.helpfulLabel")}:
          </span>
          <span>{review.helpful ?? 0}</span>
        </div>
        {typeof review.consent === "boolean" && review.consent && (
          <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-emerald-600">
            {t("reviewsPage.card.consent")}
          </span>
        )}
      </div>

      {onToggleFeatured && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={processing}
            onClick={() => onToggleFeatured(review)}
            className={`rounded-full border px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${
              processing
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : featured
                ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {processing
              ? t("reviewsPage.card.actions.processing")
              : featured
              ? t("reviewsPage.card.actions.unfeature")
              : t("reviewsPage.card.actions.feature")}
          </button>
        </div>
      )}
    </article>
  );
};

export default function ReviewsPage({ featuredOnly = false }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? "ar-SA" : "en-GB";
  const { reviews, loading, error, pagination, fetchReviews, updateReview } = useOwnerReviews();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [processingIds, setProcessingIds] = useState([]);
  const { pushToast } = useToast();

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  useEffect(() => {
    setPage(1);
  }, [featuredOnly]);

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reviews.filter((review) => {
      if (featuredOnly && !isFeaturedReview(review)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        review.name,
        review.email,
        review.phone,
        review.text,
        String(review.rating || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [reviews, search, featuredOnly]);

  const totalReviews = pagination.total || reviews.length;
  const visibleReviews = reviews.filter((review) => review.is_visible).length;
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
          reviews.length).toFixed(1)
      : "—";

  const heroTag = featuredOnly
    ? t("reviewsPage.tagFeatured")
    : t("reviewsPage.tagAll");
  const heroTitle = featuredOnly
    ? t("reviewsPage.featuredTitle")
    : t("reviewsPage.title");
  const heroDescription = featuredOnly
    ? t("reviewsPage.featuredDescription")
    : t("reviewsPage.description");

  const heroHighlights = [
    {
      label: t("reviewsPage.highlights.average"),
      value: averageRating,
      hint: t("reviewsPage.highlights.averageHint"),
    },
    {
      label: t("reviewsPage.highlights.total"),
      value: totalReviews,
      hint: t("reviewsPage.highlights.totalHint"),
    },
    {
      label: t("reviewsPage.highlights.visible"),
      value: visibleReviews,
      hint: t("reviewsPage.highlights.visibleHint"),
    },
  ];

  const totalPages = Math.max(
    1,
    Math.ceil((totalReviews || 0) / (pagination.limit || REVIEWS_PAGE_LIMIT))
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const showSkeletons = loading && reviews.length === 0;

  const handleToggleFeatured = async (review) => {
    if (!updateReview || processingIds.includes(review.id)) {
      return;
    }

    const targetFeatured = !isFeaturedReview(review);
    const metadata = {
      ...review.metadata,
      featured: targetFeatured,
    };

    setProcessingIds((prev) => [...prev, review.id]);

    const result = await updateReview(review.id, { metadata });

    setProcessingIds((prev) => prev.filter((id) => id !== review.id));

    if (result?.ok) {
      pushToast({
        type: "success",
        title: t("common.success"),
        desc: targetFeatured
          ? t("reviewsPage.toast.markedFeatured")
          : t("reviewsPage.toast.removedFeatured"),
      });
      return;
    }

    pushToast({
      type: "error",
      title: t("common.error"),
      desc: result?.error || t("reviewsPage.toast.featureError"),
    });
  };

  return (
    <div className="space-y-6">
      <DashboardHeroHeader
        tagLabel={heroTag}
        title={heroTitle}
        description={heroDescription}
        highlights={heroHighlights}
        actions={
          <button
            type="button"
            onClick={() => fetchReviews(page)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FDE68A] to-[#F59E0B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:opacity-90"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t("reviewsPage.actions.refresh")}
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/reviews"
            className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              !featuredOnly
                ? "border-[#E39B34] bg-[#fff3da] text-[#B8751A]"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {t("sidebar.allReviews")}
          </Link>
          <Link
            to="/dashboard/reviews/featured"
            className={`rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              featuredOnly
                ? "border-[#E39B34] bg-[#fff3da] text-[#B8751A]"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            {t("sidebar.featuredReviews")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FiSearch className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("reviewsPage.filters.searchPlaceholder")}
              className="w-full min-w-[220px] rounded-2xl border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
            />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-700"
            >
              {t("reviewsPage.filters.clear")}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-500">
        {filteredReviews.length
          ? t("reviewsPage.list.summary", {
              count: filteredReviews.length,
              total: totalReviews,
            })
          : featuredOnly
          ? t("reviewsPage.list.featuredEmpty")
          : t("reviewsPage.list.empty")}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchReviews(page)}
              className="text-rose-700 underline"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {showSkeletons
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white/90 p-5"
              />
            ))
        : filteredReviews.map((review) => {
              const featured = isFeaturedReview(review);
              return (
                <ReviewCard
                  key={review.id}
                  review={review}
                  locale={locale}
                  t={t}
                  featured={featured}
                  onToggleFeatured={handleToggleFeatured}
                  processing={processingIds.includes(review.id)}
                />
              );
            })}

        {!showSkeletons && filteredReviews.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            {featuredOnly
              ? t("reviewsPage.list.featuredEmpty")
              : t("reviewsPage.list.empty")}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        <span>
          {t("reviewsPage.pagination.page", {
            current: page,
            total: totalPages,
          })}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("reviewsPage.pagination.previous")}
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("reviewsPage.pagination.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
