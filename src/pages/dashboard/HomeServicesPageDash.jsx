import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { useHomeServices } from '../../hooks/owner/useHomeServices';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RiyalIcon from '../../components/RiyalIcon';

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/15';

const HomeServicesPageDash = () => {
  const { t } = useTranslation();
  const {
    services,
    categories,
    loading,
    saving,
    error,
    createHomeService,
    updateHomeService,
    deleteHomeService,
    toggleServiceStatus,
  } = useHomeServices();

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    category: '',
    is_active: true,
  });
  const [serviceSlots, setServiceSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({
    slot_time: '',
    duration_minutes: 30,
    is_active: true,
  });

  const resetSlots = () => {
    setServiceSlots([]);
    setSlotForm({
      slot_time: '',
      duration_minutes: 30,
      is_active: true,
    });
  };

  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((service) => service.is_active).length;
    const avgPrice =
      total > 0
        ? Math.round(
            services.reduce((sum, service) => sum + parseFloat(service.price || 0), 0) / total
          )
        : 0;
    return [
      {
        label: t('homeServices.stats.total', 'Total services'),
        value: total,
        hint: t('homeServices.stats.totalHint', 'All on-site offerings'),
      },
      {
        label: t('homeServices.stats.active', 'Active services'),
        value: active,
        hint: t('homeServices.stats.activeHint', 'Visible to team'),
      },
      {
        label: t('homeServices.stats.avgPrice', 'Avg. price'),
        value: (
          <span className="inline-flex items-center gap-1">
            <RiyalIcon size={18} className="text-slate-900" />
            {avgPrice}
          </span>
        ),
        hint: t('homeServices.stats.avgPriceHint', 'Per booking'),
      },
    ];
  }, [services, t]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      category: '',
      is_active: true,
    });
    resetSlots();
    setEditingService(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: formData.price ? parseFloat(formData.price) : null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes, 10) : null,
      category: formData.category || null,
      is_active: formData.is_active,
    };

    const action = editingService
      ? () => updateHomeService(editingService.id, submitData)
      : () => createHomeService(submitData);
    submitData.slots = serviceSlots;

    const result = await action();
    if (result.success) {
      resetForm();
    }
  };

  const handleEdit = async (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      duration_minutes: service.duration_minutes || '',
      category: service.category || '',
      is_active: service.is_active,
    });
    setSlotForm({
      slot_time: '',
      duration_minutes: 30,
      is_active: true,
    });
    setShowForm(true);
    await loadServiceSlots(service.id);
  };

  async function loadServiceSlots(serviceId) {
    if (!serviceId) {
      setServiceSlots([]);
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/home-services/${serviceId}/slots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setServiceSlots(data.slots || []);
      } else {
        setServiceSlots([]);
      }
    } catch (err) {
      console.error("Failed to load service slots:", err);
      setServiceSlots([]);
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setDeleting(true);
    await deleteHomeService(serviceToDelete.id);
    setDeleting(false);
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const handleToggleStatus = async (service) => {
    await toggleServiceStatus(service.id, service.is_active);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] flex items-center justify-center">
        <div className="relative inline-flex h-12 w-12 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
            {t('common.loadingShort', 'LO')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {t('homeServices.tag', 'On-site kits')}
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                {t('homeServices.title', 'Home Services')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {t('homeServices.subtitle', 'Manage services available for home appointments')}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('homeServices.addService', 'Add Service')}
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-100 bg-rose-50/80 p-4 text-sm text-rose-700 shadow-inner shadow-rose-200/50">
            {error}
          </div>
        )}

        {showForm && (
          <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="border-b border-white/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingService
                  ? t('homeServices.editService', 'Edit Service')
                  : t('homeServices.addNewService', 'Add New Service')}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t('homeServices.serviceName', 'Service Name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={inputClass}
                      placeholder={t('homeServices.namePlaceholder', 'e.g., Haircut at Home')}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t('homeServices.category', 'Category')}
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value || null }))
                      }
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">{t('homeServices.selectCategory', 'Select a category')}</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t('homeServices.duration', 'Duration')} (minutes) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration_minutes: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t('homeServices.price', 'Price')} (SAR) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                    />
                    {t('homeServices.active', 'Active')}
                  </label>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    {t('homeServices.description', 'Description')}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder={t('homeServices.descriptionPlaceholder', 'Describe the service...')}
                  />
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">
                    {t('homeServices.slotsTitle', 'Available hours')}
                  </h3>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                    <input
                      type="time"
                      value={slotForm.slot_time}
                      onChange={(e) => setSlotForm((prev) => ({ ...prev, slot_time: e.target.value }))}
                      className={inputClass}
                      placeholder={t('homeServices.slotsTime', 'Slot time')}
                    />
                    <input
                      type="number"
                      min="1"
                      value={slotForm.duration_minutes}
                      onChange={(e) => setSlotForm((prev) => ({ ...prev, duration_minutes: parseInt(e.target.value, 10) || 30 }))}
                      className={inputClass}
                      placeholder={t('homeServices.slotsDuration', 'Duration')}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={slotForm.is_active}
                        onChange={(e) => setSlotForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                      />
                      {t('homeServices.slotsActive', 'Active')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (!slotForm.slot_time) return;
                        setServiceSlots((prev) => [
                          ...prev.filter((slot) => slot.slot_time !== slotForm.slot_time),
                          { ...slotForm },
                        ]);
                        setSlotForm({ slot_time: "", duration_minutes: 30, is_active: true });
                      }}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#cf8629]"
                    >
                      {t('homeServices.slotsAdd', 'Add slot')}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {serviceSlots.map((slot) => (
                      <div
                        key={slot.slot_time}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{slot.slot_time}</p>
                          <p className="text-xs text-slate-500">
                            {slot.duration_minutes} {t('bookings.minutes', 'min')} ·{" "}
                            {slot.is_active ? t('homeServices.slotsActive', 'Active') : t('homeServices.slotsInactive', 'Inactive')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setServiceSlots((prev) => prev.filter((item) => item.slot_time !== slot.slot_time))
                          }
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                        >
                          {t('common.delete', 'Delete')}
                        </button>
                      </div>
                    ))}
                    {!serviceSlots.length && (
                      <p className="text-xs text-slate-500">
                        {t('homeServices.slotsHelp', 'Define store hours that apply to service bookings.')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-3 border-t border-white/60 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        {t('common.saving', 'Saving...')}
                      </>
                    ) : editingService ? (
                      t('common.update', 'Update')
                    ) : (
                      t('common.create', 'Create')
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="border-b border-white/50 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('homeServices.servicesList', 'Services')}</h2>
            <span className="text-sm text-slate-500">
              {services.length} {t('homeServices.services', 'services')}
            </span>
          </div>
          <div className="p-6">
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t('homeServices.noServices', 'No services yet')}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {t('homeServices.noServicesDesc', 'Get started by creating your first home service.')}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('homeServices.addFirstService', 'Add Your First Service')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                        {service.category_data && (
                          <span className="mt-2 inline-flex rounded-full border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500">
                            {service.category_data.label}
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          service.is_active
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border border-slate-200 bg-slate-50 text-slate-500'
                        }`}
                      >
                        {service.is_active ? t('homeServices.active', 'Active') : t('homeServices.inactive', 'Inactive')}
                      </span>
                    </div>
                    {service.description && (
                      <p className="mt-3 text-sm text-slate-600">{service.description}</p>
                    )}
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>{t('homeServices.price', 'Price')}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                          <RiyalIcon size={16} />
                          {service.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{t('homeServices.duration', 'Duration')}</span>
                        <span className="font-semibold text-slate-900">
                          {service.duration_minutes} {t('homeServices.minutes', 'min')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/60 pt-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(service)}
                          className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition ${
                            service.is_active
                              ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {service.is_active
                            ? t('homeServices.deactivate', 'Deactivate')
                            : t('homeServices.activate', 'Activate')}
                        </button>
                        <button
                          onClick={() => handleEdit(service)}
                          className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          {t('common.edit', 'Edit')}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(service)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        {t('common.delete', 'Delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          open={deleteModalOpen}
          title={t('homeServices.confirmDeleteTitle', 'Delete Service')}
          desc={t('homeServices.confirmDelete', 'Are you sure you want to delete this service? This action cannot be undone.')}
          confirmLabel={t('common.delete', 'Delete')}
          cancelLabel={t('common.cancel', 'Cancel')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalOpen(false)}
          loading={deleting}
          danger
        />
      </div>
    </div>
  );
};

export default HomeServicesPageDash;
