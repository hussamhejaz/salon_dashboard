import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import DashboardHeroHeader from '../../components/dashboard/DashboardHeroHeader';

const timeInputClass =
  "rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 transition focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/15";

const WorkingHoursPage = () => {
  const { t } = useTranslation();
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const daysOfWeek = useMemo(
    () => [
      { id: 0, name: t('days.sun', 'الأحد') },
      { id: 1, name: t('days.mon', 'الإثنين') },
      { id: 2, name: t('days.tue', 'الثلاثاء') },
      { id: 3, name: t('days.wed', 'الأربعاء') },
      { id: 4, name: t('days.thu', 'الخميس') },
      { id: 5, name: t('days.fri', 'الجمعة') },
      { id: 6, name: t('days.sat', 'السبت') },
  ],
    [t]
  );

  const heroHighlights = useMemo(() => {
    const openDays = workingHours.filter(day => !day.is_closed).length;
    const closedDays = daysOfWeek.length - openDays;
    const breakDays = workingHours.filter(day => day.break_start && !day.is_closed).length;
    return [
      {
        label: t('workingHours.stats.openDays', 'أيام العمل'),
        value: openDays,
        hint: t('workingHours.stats.openDaysHint', 'أيام مفتوحة اليوم'),
      },
      {
        label: t('workingHours.stats.closedDays', 'أيام الإجازة'),
        value: closedDays,
        hint: t('workingHours.stats.closedDaysHint', 'مغلقة لهذا الأسبوع'),
      },
      {
        label: t('workingHours.stats.breaks', 'أيام بها استراحة'),
        value: breakDays,
        hint: t('workingHours.stats.breaksHint', 'أيام توفر استراحة'),
      },
      {
        label: t('workingHours.stats.timezone', 'المنطقة الزمنية'),
        value: t('workingHours.stats.timezoneLabel', 'Asia/Riyadh'),
        hint: t('workingHours.stats.timezoneHint', 'التوقيت المعتمد'),
      },
    ];
  }, [workingHours, daysOfWeek, t]);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError('');

      // Use the correct token key from localStorage
      const token = localStorage.getItem('auth_token');
      
      console.log('🔐 [WORKING HOURS] Fetching with token:', token ? 'Found' : 'Not found');

      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${API_BASE}/api/owner/working-hours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      console.log('📋 [WORKING HOURS] Fetch response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.error || `Failed to load working hours: ${response.status}`);
      }

      if (data.ok) {
        // If no working hours exist, initialize with defaults
        if (!data.workingHours || data.workingHours.length === 0) {
          console.log('⚠️ No working hours found, initializing defaults');
          const defaultHours = daysOfWeek.map(day => ({
            day_of_week: day.id,
            is_closed: [5, 6].includes(day.id), // Friday and Saturday closed by default
            open_time: [5, 6].includes(day.id) ? null : '09:00',
            close_time: [5, 6].includes(day.id) ? null : '18:00',
            break_start: [5, 6].includes(day.id) ? null : '13:00',
            break_end: [5, 6].includes(day.id) ? null : '14:00'
          }));
          setWorkingHours(defaultHours);
        } else {
          console.log('✅ Working hours loaded:', data.workingHours.length);
          setWorkingHours(data.workingHours);
        }
      } else {
        throw new Error(data.error || 'Unknown error from server');
      }
    } catch (err) {
      console.error('❌ Error fetching working hours:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (dayIndex, field, value) => {
    const updatedHours = [...workingHours];
    let day = updatedHours.find(d => d.day_of_week === dayIndex);
    
    // If day doesn't exist, create it
    if (!day) {
      day = {
        day_of_week: dayIndex,
        is_closed: false,
        open_time: '09:00',
        close_time: '18:00',
        break_start: '13:00',
        break_end: '14:00'
      };
      updatedHours.push(day);
    }
    
    if (field === 'is_closed') {
      day.is_closed = value;
      if (value) {
        // Clear times when closing day
        day.open_time = null;
        day.close_time = null;
        day.break_start = null;
        day.break_end = null;
      } else {
        // Set default times when opening day
        day.open_time = day.open_time || '09:00';
        day.close_time = day.close_time || '18:00';
        day.break_start = day.break_start || '13:00';
        day.break_end = day.break_end || '14:00';
      }
    } else {
      day[field] = value;
    }
    
    setWorkingHours(updatedHours);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('💾 Saving working hours:', workingHours);

      // Ensure we have all 7 days
      const completeHours = daysOfWeek.map(day => {
        const existing = workingHours.find(d => d.day_of_week === day.id);
        return existing || {
          day_of_week: day.id,
          is_closed: [5, 6].includes(day.id),
          open_time: [5, 6].includes(day.id) ? null : '09:00',
          close_time: [5, 6].includes(day.id) ? null : '18:00',
          break_start: [5, 6].includes(day.id) ? null : '13:00',
          break_end: [5, 6].includes(day.id) ? null : '14:00'
        };
      });

      const response = await fetch(`${API_BASE}/api/owner/working-hours`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          workingHours: completeHours,
          timezone: "Asia/Riyadh"
        }),
      });

      const data = await response.json();
      console.log('💾 Save response:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.error || `Failed to save working hours: ${response.status}`);
      }

      if (data.ok) {
        setSuccess(t('workingHours.saved', 'تم حفظ أوقات العمل بنجاح'));
        setWorkingHours(data.workingHours || completeHours);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(data.error || 'Failed to save working hours');
      }
    } catch (err) {
      console.error('❌ Error saving working hours:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm(t('workingHours.resetConfirm', 'هل أنت متأكد من إعادة تعيين أوقات العمل إلى الإعدادات الافتراضية؟'))) {
      try {
        setSaving(true);
        setError('');
        
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch(`${API_BASE}/api/owner/working-hours/reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Failed to reset working hours: ${response.status}`);
        }

        if (data.ok) {
          setSuccess(t('workingHours.resetSuccess', 'تم إعادة التعيين إلى الإعدادات الافتراضية'));
          setWorkingHours(data.workingHours || []);
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error(data.error || 'Failed to reset working hours');
        }
      } catch (err) {
        console.error('❌ Error resetting working hours:', err);
        setError(err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const formatTimeForInput = (time) => {
    if (!time) return '';
    // Convert HH:MM:SS to HH:MM for input[type="time"]
    return time.substring(0, 5);
  };

  if (loading) {
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

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t('workingHours.tag', 'الجدول')}
          title={t('workingHours.title', 'إدارة أوقات العمل')}
          description={t('workingHours.subtitle', 'حدد أوقات العمل لكل يوم من أيام الأسبوع')}
          highlights={heroHighlights}
        />

        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="border-b border-white/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 text-right">
              {t('workingHours.weeklyHours', 'الجدول الأسبوعي لأوقات العمل')}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-right text-sm text-rose-700">
                ❌ {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-right text-sm text-emerald-700">
                ✅ {success}
              </div>
            )}

            <div className="space-y-4">
              {daysOfWeek.map(day => {
                const dayData = workingHours.find(d => d.day_of_week === day.id) || {};

                return (
                  <div
                    key={day.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm transition hover:bg-white"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!dayData.is_closed}
                          onChange={(e) => handleDayChange(day.id, 'is_closed', !e.target.checked)}
                          className="w-5 h-5 rounded focus:ring-[#E39B34] border-slate-300 text-[#E39B34]"
                        />
                        <span className={`font-semibold text-lg ${dayData.is_closed ? 'text-slate-400' : 'text-slate-900'}`}>
                          {day.name}
                        </span>
                      </label>
                    </div>

                    {!dayData.is_closed ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{t('workingHours.from', 'من')}</span>
                          <input
                            type="time"
                            value={formatTimeForInput(dayData.open_time)}
                            onChange={(e) => handleDayChange(day.id, 'open_time', e.target.value)}
                            className={`${timeInputClass} w-24`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{t('workingHours.to', 'إلى')}</span>
                          <input
                            type="time"
                            value={formatTimeForInput(dayData.close_time)}
                            onChange={(e) => handleDayChange(day.id, 'close_time', e.target.value)}
                            className={`${timeInputClass} w-24`}
                          />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{t('workingHours.breakLabel', 'استراحة')}:</span>
                          <input
                            type="time"
                            value={formatTimeForInput(dayData.break_start)}
                            onChange={(e) => handleDayChange(day.id, 'break_start', e.target.value)}
                            className={`${timeInputClass} w-24 text-xs px-2 py-1`}
                            placeholder={t('workingHours.breakStart', 'بداية')}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={formatTimeForInput(dayData.break_end)}
                            onChange={(e) => handleDayChange(day.id, 'break_end', e.target.value)}
                            className={`${timeInputClass} w-24 text-xs px-2 py-1`}
                            placeholder={t('workingHours.breakEnd', 'نهاية')}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-rose-600 font-semibold">
                        {t('workingHours.closed', 'مغلق')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-white/60 pt-6">
              <button
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('workingHours.reset', 'إعادة التعيين')}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('workingHours.saving', 'جاري الحفظ...')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('workingHours.save', 'حفظ التغييرات')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur text-right">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">ملاحظة هامة</h4>
              <p className="text-blue-800 text-sm">
                {t(
                  'workingHours.tip',
                  'تأكد من تعيين أوقات العمل بشكل صحيح لكل يوم. يمكنك تعيين أيام الإجازة عن طريق إلغاء تحديد اليوم. سيتم عرض هذه الأوقات للعملاء على الموقع العام.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkingHoursPage;
