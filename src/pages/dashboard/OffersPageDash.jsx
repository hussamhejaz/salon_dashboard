// src/pages/owner/OffersPageDash.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOffers, useOfferForm } from '../../hooks/owner/useOffers';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/useToast';
import DashboardHeroHeader from '../../components/dashboard/DashboardHeroHeader';
import RiyalIcon from '../../components/RiyalIcon';
import { formInputClass } from '../../utils/uiClasses';

const OffersPageDash = () => {
  const { t } = useTranslation();
  const { pushToast } = useToast();
  
  const {
    offers,
    stats,
    categories,
    services,
    servicesLoading,
    loading,
    error,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOfferActive,
    getOfferStatus,
    clearError,
    isOwner,
  } = useOffers();

  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    creating: false,
    updating: false,
    deleting: false,
    toggling: false
  });

  const heroHighlights = useMemo(() => [
    {
      label: t('offers.hero.highlights.total', 'Total offers'),
      value: stats?.total_offers || 0,
      hint: t('offers.hero.highlights.totalHint', 'All published offers')
    },
    {
      label: t('offers.hero.highlights.active', 'Active offers'),
      value: stats?.active_offers || 0,
      hint: t('offers.hero.highlights.activeHint', 'Visible to clients')
    },
    {
      label: t('offers.hero.highlights.expired', 'Expired offers'),
      value: stats?.expired_offers || 0,
      hint: t('offers.hero.highlights.expiredHint', 'Past campaigns')
    },
    {
      label: t('offers.hero.highlights.uses', 'Total uses'),
      value: stats?.total_uses || 0,
      hint: t('offers.hero.highlights.usesHint', 'Redemptions logged')
    }
  ], [stats, t]);

  // Use the form hook
  const {
    formData,
    errors: formErrors,
    touched,
    updateField,
    handleBlur,
    validateForm,
    resetForm,
    setFormData
  } = useOfferForm();

  // Helper function to format numbers with 2 decimal places
  const formatPrice = (price) => {
    return Number(price || 0).toFixed(2);
  };

  const servicesAvailable = services.length > 0;

  const serviceMap = useMemo(() => {
    const map = new Map();
    services.forEach((service) => {
      map.set(String(service.id), service);
    });
    return map;
  }, [services]);

  const getLinkedService = (offer) => {
    if (!offer?.service_id) return null;
    return serviceMap.get(String(offer.service_id));
  };

  // Reset form when editing offer changes
  useEffect(() => {
      if (editingOffer) {
        setFormData({
          title: editingOffer.title || '',
          description: editingOffer.description || '',
          category: editingOffer.category || '',
          service_id: editingOffer.service_id ? String(editingOffer.service_id) : '',
        discount_percentage: editingOffer.discount_percentage || '',
        discount_amount: editingOffer.discount_amount || '',
        original_price: editingOffer.original_price || '',
        final_price: editingOffer.final_price || '',
        start_date: editingOffer.start_date ? editingOffer.start_date.split('T')[0] : '',
        end_date: editingOffer.end_date ? editingOffer.end_date.split('T')[0] : '',
        terms_conditions: editingOffer.terms_conditions || '',
        max_uses: editingOffer.max_uses || '',
        is_active: editingOffer.is_active ?? true,
      });
    }
  }, [editingOffer, setFormData]);

  // Show toast for errors
  useEffect(() => {
    if (error) {
      pushToast({
        type: 'error',
        title: t('common.error', 'خطأ'),
        desc: error,
        duration: 5000,
      });
      clearError();
    }
  }, [error, pushToast, clearError, t]);

  const handleFormReset = () => {
    resetForm();
    setEditingOffer(null);
    setShowForm(false);
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const serviceValidationMsg = t('validation.selectService', 'Please select a service');

    if (
      !validateForm({
        requireService: servicesAvailable,
        serviceErrorMessage: serviceValidationMsg,
      })
    ) {
      pushToast({
        type: 'error',
        title: t('common.validationError', 'خطأ في التحقق'),
        desc: t('offers.formValidationFailed', 'يرجى التحقق من صحة البيانات المدخلة'),
        duration: 4000,
      });
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      category: formData.category || null,
      discount_percentage: formData.discount_percentage ? parseFloat(formData.discount_percentage) : null,
      discount_amount: formData.discount_amount ? parseFloat(formData.discount_amount) : null,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      final_price: formData.final_price ? parseFloat(formData.final_price) : null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      terms_conditions: formData.terms_conditions || null,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      service_id: formData.service_id || null,
      is_active: formData.is_active,
    };

    try {
      if (editingOffer) {
        setActionLoading(prev => ({ ...prev, updating: true }));
        const result = await updateOffer(editingOffer.id, submitData);
        if (result.ok) {
          pushToast({
            type: 'success',
            title: t('common.success', 'تم بنجاح'),
            desc: t('offers.offerUpdated', 'تم تحديث العرض بنجاح'),
            duration: 3000,
          });
          handleFormReset();
        } else {
          pushToast({
            type: 'error',
            title: t('common.error', 'خطأ'),
            desc: result.error || t('offers.updateFailed', 'فشل في تحديث العرض'),
            duration: 5000,
          });
        }
      } else {
        setActionLoading(prev => ({ ...prev, creating: true }));
        const result = await createOffer(submitData);
        if (result.ok) {
          pushToast({
            type: 'success',
            title: t('common.success', 'تم بنجاح'),
            desc: t('offers.offerCreated', 'تم إنشاء العرض بنجاح'),
            duration: 3000,
          });
          handleFormReset();
        } else {
          pushToast({
            type: 'error',
            title: t('common.error', 'خطأ'),
            desc: result.error || t('offers.createFailed', 'فشل في إنشاء العرض'),
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error('Error submitting offer:', err);
      pushToast({
        type: 'error',
        title: t('common.error', 'خطأ'),
        desc: t('offers.operationFailed', 'فشل في تنفيذ العملية'),
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => ({ 
        ...prev, 
        creating: false, 
        updating: false 
      }));
    }
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setShowForm(true);
    clearError();
  };

  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    
    try {
      setActionLoading(prev => ({ ...prev, deleting: true }));
      const result = await deleteOffer(offerToDelete.id);
      if (result.ok) {
        pushToast({
          type: 'success',
          title: t('common.success', 'تم بنجاح'),
          desc: t('offers.offerDeleted', 'تم حذف العرض بنجاح'),
          duration: 3000,
        });
        setDeleteModalOpen(false);
        setOfferToDelete(null);
      } else {
        pushToast({
          type: 'error',
          title: t('common.error', 'خطأ'),
          desc: result.error || t('offers.deleteFailed', 'فشل في حذف العرض'),
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      pushToast({
        type: 'error',
        title: t('common.error', 'خطأ'),
        desc: t('offers.deleteFailed', 'فشل في حذف العرض'),
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, deleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setOfferToDelete(null);
  };

  const handleToggleStatus = async (offer) => {
    try {
      setActionLoading(prev => ({ ...prev, toggling: true }));
      const result = await toggleOfferActive(offer.id, offer.is_active);
      if (result.ok) {
        pushToast({
          type: 'success',
          title: t('common.success', 'تم بنجاح'),
          desc: offer.is_active 
            ? t('offers.offerDeactivated', 'تم إيقاف العرض بنجاح')
            : t('offers.offerActivated', 'تم تفعيل العرض بنجاح'),
          duration: 3000,
        });
      } else {
        pushToast({
          type: 'error',
          title: t('common.error', 'خطأ'),
          desc: result.error || t('offers.statusChangeFailed', 'فشل في تغيير حالة العرض'),
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('Error toggling offer status:', err);
      pushToast({
        type: 'error',
        title: t('common.error', 'خطأ'),
        desc: t('offers.statusChangeFailed', 'فشل في تغيير حالة العرض'),
        duration: 5000,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, toggling: false }));
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return 0;
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate discount percentage if not provided
  const calculateDiscountPercentage = (offer) => {
    if (offer.discount_percentage !== undefined && offer.discount_percentage !== null) {
      return Math.round(Number(offer.discount_percentage));
    }
    const originalPrice = Number(offer.original_price);
    const finalPrice = Number(offer.final_price);
    if (originalPrice > 0 && !Number.isNaN(finalPrice)) {
      return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
    }
    return 0;
  };

  // Get category label from value
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Get offer status with enhanced logic
  const getEnhancedOfferStatus = (offer) => {
    const status = getOfferStatus(offer);
    const daysRemaining = getDaysRemaining(offer.end_date);
    
    if (status === 'active' && daysRemaining < 3) {
      return 'ending-soon';
    }
    return status;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'ending-soon': return 'bg-orange-100 text-orange-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return t('offers.active', 'نشط');
      case 'ending-soon': return t('offers.endingSoon', 'ينتهي قريباً');
      case 'scheduled': return t('offers.scheduled', 'مجدول');
      case 'expired': return t('offers.expired', 'منتهي');
      case 'inactive': return t('offers.inactive', 'غير نشط');
      default: return t('offers.inactive', 'غير نشط');
    }
  };

  if (!isOwner) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {t('offers.accessDenied', 'الوصول مرفوض')}
          </h2>
          <p className="text-red-600">
            {t('offers.ownerPrivilegesRequired', 'تحتاج إلى صلاحيات المالك للوصول إلى هذه الصفحة')}
          </p>
        </div>
      </div>
    );
  }

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] flex items-center justify-center">
        <div className="relative inline-flex h-12 w-12 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
            {t("common.loadingShort", "LO")}
          </span>
        </div>
      </div>
    );
  }

  const saving = actionLoading.creating || actionLoading.updating;

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t("offers.hero.tag", "Promo Control")}
          title={t("offers.title", "العروض والتخفيفات")}
          description={t("offers.subtitle", "إدارة العروض والتخفيفات الخاصة بمناقشك")}
          highlights={heroHighlights}
          actions={
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('offers.addOffer', 'إضافة عرض')}
            </button>
          }
        />

        {showForm && (
          <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/10 backdrop-blur">
            <div className="border-b border-white/60 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingOffer ? t('offers.editOffer', 'تعديل العرض') : t('offers.addNewOffer', 'إضافة عرض جديد')}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.offerTitle', 'عنوان العرض')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    onBlur={() => handleBlur('title')}
                    className={formInputClass}
                    placeholder={t('offers.titlePlaceholder', 'e.g., تخفيضات الصيف')}
                  />
                  {formErrors.title && touched.title && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.category', 'الفئة')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`${formInputClass} appearance-none`}
                  >
                    <option value="">{t('offers.selectCategory', 'اختر الفئة')}</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.linkedService', 'الخدمة المرتبطة')} *
                  </label>
                  <select
                    value={formData.service_id || ''}
                    onChange={(e) => updateField('service_id', e.target.value)}
                    onBlur={() => handleBlur('service_id')}
                    className={`${formInputClass} appearance-none`}
                    disabled={servicesLoading || services.length === 0}
                  >
                    <option value="">
                      {servicesLoading
                        ? t('offers.loadingServices', 'Loading services...')
                        : services.length
                          ? t('offers.selectService', 'اختر خدمة')
                          : t('offers.noServices', 'لا توجد خدمات')}
                    </option>
                    {services.map((service) => {
                      const meta = [];
                      if (service.duration_minutes) {
                        meta.push(`${service.duration_minutes} ${t('common.minutes', 'minutes')}`);
                      }
                      if (service.price !== undefined && service.price !== null) {
                        meta.push(`${formatPrice(service.price)} ${t('common.currency', 'SAR')}`);
                      }
                      return (
                        <option key={service.id} value={String(service.id)}>
                          {[service.name, ...meta].filter(Boolean).join(' · ')}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.service_id && touched.service_id && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.service_id}</p>
                  )}
                  {!servicesLoading && services.length === 0 && (
                    <p className="mt-2 text-xs text-yellow-700">
                      {t('offers.serviceRequired', 'أضف خدمة لتتمكن من ربط العرض')}
                      {' '}
                      <Link
                        to="/dashboard/pricing"
                        className="text-[#E39B34] font-semibold underline underline-offset-2"
                      >
                        {t('pricing.actions.addService', 'Add New Service')}
                      </Link>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('offers.description', 'الوصف')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  rows={3}
                  className={`${formInputClass} resize-none`}
                  placeholder={t('offers.descriptionPlaceholder', 'وصف مفصل للعرض...')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.originalPrice', 'السعر الأصلي')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => updateField('original_price', e.target.value)}
                    onBlur={() => handleBlur('original_price')}
                    className={formInputClass}
                    placeholder="0.00"
                  />
                  {formErrors.original_price && touched.original_price && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.original_price}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('offers.discountPercentage', 'نسبة الخصم %')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount_percentage}
                      onChange={(e) => updateField('discount_percentage', e.target.value)}
                      onBlur={() => handleBlur('discount_percentage')}
                      className={formInputClass}
                      placeholder="20"
                    />
                    {formErrors.discount_percentage && touched.discount_percentage && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.discount_percentage}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('offers.discountAmount', 'قيمة الخصم')}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discount_amount}
                      onChange={(e) => updateField('discount_amount', e.target.value)}
                      onBlur={() => handleBlur('discount_amount')}
                      className={formInputClass}
                      placeholder="0.00"
                    />
                    {formErrors.discount_amount && touched.discount_amount && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.discount_amount}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.finalPrice', 'السعر النهائي')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.final_price}
                    onChange={(e) => updateField('final_price', e.target.value)}
                    onBlur={() => handleBlur('final_price')}
                    className={formInputClass}
                    placeholder="0.00"
                  />
                  {formErrors.final_price && touched.final_price && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.final_price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.maxUses', 'الحد الأقصى للاستخدامات')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => updateField('max_uses', e.target.value)}
                    onBlur={() => handleBlur('max_uses')}
                    className={formInputClass}
                    placeholder="100"
                  />
                  {formErrors.max_uses && touched.max_uses && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.max_uses}</p>
                  )}
                </div>
              </div>

              {/* Price Calculation Summary */}
              {(formData.discount_percentage || formData.discount_amount || formData.final_price) && formData.original_price && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    {t('offers.priceSummary', 'ملخص الأسعار')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">
                        {t('offers.originalPrice', 'السعر الأصلي')}:
                      </span>
                      <div className="font-bold flex items-center gap-1">
                        {formatPrice(formData.original_price)}
                        <RiyalIcon size={14} />
                      </div>
                    </div>
                    {formData.discount_percentage && (
                      <div>
                        <span className="text-blue-600">
                          {t('offers.discountPercentage', 'نسبة الخصم')}:
                        </span>
                        <div className="font-bold">
                          {Number(formData.discount_percentage).toFixed(0)}%
                        </div>
                      </div>
                    )}
                    {formData.discount_amount && (
                      <div>
                        <span className="text-blue-600">
                          {t('offers.discountAmount', 'قيمة الخصم')}:
                        </span>
                        <div className="font-bold flex items-center gap-1">
                          {formatPrice(formData.discount_amount)}
                          <RiyalIcon size={14} />
                        </div>
                      </div>
                    )}
                    {formData.final_price && (
                      <div>
                        <span className="text-blue-600">
                          {t('offers.finalPrice', 'السعر النهائي')}:
                        </span>
                        <div className="font-bold text-green-600 flex items-center gap-1">
                          {formatPrice(formData.final_price)}
                          <RiyalIcon size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    {t('offers.discountNote', 'ملاحظة: استخدم إما نسبة الخصم أو قيمة الخصم، وليس كلاهما')}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.startDate', 'تاريخ البدء')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => updateField('start_date', e.target.value)}
                    onBlur={() => handleBlur('start_date')}
                    className={formInputClass}
                  />
                  {formErrors.start_date && touched.start_date && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('offers.endDate', 'تاريخ الانتهاء')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => updateField('end_date', e.target.value)}
                    onBlur={() => handleBlur('end_date')}
                    className={formInputClass}
                  />
                  {formErrors.end_date && touched.end_date && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#E39B34] focus:ring-[#E39B34]"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('offers.active', 'نشط')}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('offers.termsConditions', 'الشروط والأحكام')}
                </label>
                <textarea
                  value={formData.terms_conditions}
                  onChange={(e) => updateField('terms_conditions', e.target.value)}
                  onBlur={() => handleBlur('terms_conditions')}
                  rows={4}
                  className={`${formInputClass} resize-none`}
                  placeholder={t('offers.termsPlaceholder', 'أدخل الشروط والأحكام...')}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleFormReset}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-[#E39B34] rounded-lg hover:bg-[#cf8a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {saving 
                    ? t('common.saving', 'جاري الحفظ...') 
                    : editingOffer 
                      ? t('common.update', 'تحديث') 
                      : t('common.create', 'إنشاء')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offers Grid */}
      <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="px-6 py-4 border-b border-white/60 bg-white/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('offers.offersList', 'قائمة العروض')}
            </h2>
            <span className="text-sm text-gray-500">
              {offers.length}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {offers.length === 0 ? (
            <div className="rounded-2xl border border-white/70 bg-white/80 p-10 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('offers.noOffers', 'لا توجد عروض بعد')}
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                {t('offers.noOffersDesc', 'ابدأ بإنشاء أول عرض تخفيض لعملائك.')}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E39B34] text-white rounded-lg hover:bg-[#cf8a2b] focus:outline-none focus:ring-2 focus:ring-[#E39B34] focus:ring-offset-2 transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('offers.addFirstOffer', 'أضف أول عرض')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => {
                const discountPercentage = calculateDiscountPercentage(offer);
                const daysRemaining = getDaysRemaining(offer.end_date);
                const status = getEnhancedOfferStatus(offer);
                const linkedService = getLinkedService(offer);

                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {offer.title}
                        </h3>
                        {offer.category && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                            {getCategoryLabel(offer.category)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-bold text-[#E39B34]">
                          {discountPercentage}%
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>
                    </div>

                    {/* Service info */}
                    {linkedService ? (
                      <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {t('common.service', 'Service')}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {linkedService.name}
                          </p>
                        </div>
                        <div className="text-right text-xs text-slate-500 space-y-1">
                          {linkedService.duration_minutes && (
                            <p>
                              {linkedService.duration_minutes} {t('common.minutes', 'minutes')}
                            </p>
                          )}
                          {linkedService.price !== undefined && linkedService.price !== null && (
                            <p className="flex items-center justify-end gap-1 text-slate-600">
                              <RiyalIcon size={12} />
                              {formatPrice(linkedService.price)}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      offer.service_id && !servicesLoading && (
                        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                          {t('offers.missingService', 'الخدمة المرتبطة لم تعد متوفرة')}
                        </div>
                      )
                    )}

                    {/* Description */}
                    {offer.description && (
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {offer.description}
                      </p>
                    )}


                    {/* Details */}
                    <div className="space-y-3 mb-4 text-sm">
                      {offer.original_price && offer.final_price && (
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-600 font-medium">
                            {t('offers.price', 'السعر')}:
                          </span>
                          <div className="text-right">
                            <div className="line-through text-gray-400 text-xs flex items-center gap-1 justify-end">
                              {formatPrice(offer.original_price)}
                              <RiyalIcon size={12} />
                            </div>
                            <div className="font-bold text-gray-900 flex items-center gap-1 justify-end">
                              {formatPrice(offer.final_price)}
                              <RiyalIcon size={14} />
                            </div>
                          </div>
                        </div>
                      )}

                      {status !== 'expired' && daysRemaining > 0 && (
                        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                          <span className="text-blue-700 font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('offers.endsIn', 'ينتهي في')}:
                          </span>
                          <span className="font-semibold text-blue-700">
                            {daysRemaining} {t('offers.days', 'أيام')}
                          </span>
                        </div>
                      )}

                      {offer.used_count !== undefined && offer.max_uses && (
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-600 font-medium">
                            {t('offers.usage', 'الاستخدام')}:
                          </span>
                          <span className="font-semibold text-gray-700">
                            {offer.used_count} / {offer.max_uses}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(offer)}
                          disabled={actionLoading.toggling}
                          className={`px-3 py-1.5 text-xs rounded font-medium transition-colors disabled:opacity-50 ${
                            offer.is_active
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {actionLoading.toggling 
                            ? t('common.loading', 'جاري...') 
                            : offer.is_active
                              ? t('offers.deactivate', 'إيقاف')
                              : t('offers.activate', 'تفعيل')}
                        </button>
                        <button
                          onClick={() => handleEdit(offer)}
                          className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium transition-colors"
                        >
                          {t('common.edit', 'تعديل')}
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(offer)}
                        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium transition-colors"
                      >
                        {t('common.delete', 'حذف')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    <ConfirmModal
        open={deleteModalOpen}
        title={t('offers.confirmDeleteTitle', 'تأكيد الحذف')}
        desc={t('offers.confirmDelete', 'هل أنت متأكد من حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.')}
        confirmLabel={t('common.delete', 'حذف')}
        cancelLabel={t('common.cancel', 'إلغاء')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={actionLoading.deleting}
        danger={true}
      />
    </section>
  );
};

export default OffersPageDash;
