import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../hooks/owner/useProfile';
import DashboardHeroHeader from '../../components/dashboard/DashboardHeroHeader';
import { formInputClass } from '../../utils/uiClasses';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { profile, loading, error, updateProfile, changePassword } = useProfile();
  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [profileData, setProfileData] = useState({
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updating, setUpdating] = useState(false);
  const salon = profile?.salon || {};
  const owner = profile?.user || {};

  const heroHighlights = useMemo(() => {
    return [
      {
        label: t('profile.stats.plan', 'Plan Type'),
        value: salon.plan_type || t('profile.stats.planMissing', 'Standard'),
        hint: t('profile.stats.planHint', 'Assigned package'),
      },
      {
        label: t('profile.stats.location', 'Location'),
        value: salon.city || t('common.notAvailable', 'Not available'),
        hint: t('profile.stats.locationHint', 'Salon city'),
      },
      {
        label: t('profile.stats.contact', 'Contact'),
        value: owner.email || t('common.notAvailable', 'Not available'),
        hint: t('profile.stats.contactHint', 'Owner email'),
      },
    ];
  }, [salon.city, salon.plan_type, owner.email, t]);

  // Update profile data when profile loads
  React.useEffect(() => {
    if (profile?.user) {
      setProfileData({
        email: profile.user.email || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    setUpdating(true);

    const result = await updateProfile(profileData.email);
    
    if (result.success) {
      setSuccess(t('profile.updateSuccess', 'Profile updated successfully'));
    } else {
      setFormError(result.error);
    }
    setUpdating(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError(t('profile.passwordsNotMatch', 'New passwords do not match'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setFormError(t('profile.passwordTooShort', 'Password must be at least 6 characters long'));
      return;
    }

    setUpdating(true);
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (result.success) {
      setSuccess(t('profile.passwordSuccess', 'Password changed successfully'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setFormError(result.error);
    }
    setUpdating(false);
  };

  const handleProfileInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] flex items-center justify-center">
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
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t('profile.tag', 'Owner Control')}
          title={t('profile.title', 'My Profile')}
          description={t('profile.subtitle', 'Manage your account settings and preferences')}
          highlights={heroHighlights}
        />

        <section className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5">
          <div className="px-6 py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t('profile.salonName', 'Salon Name'), value: salon.name },
              { label: t('profile.phone', 'Phone'), value: salon.phone },
              { label: t('profile.city', 'City'), value: salon.city },
              { label: t('profile.email', 'Email Address'), value: owner.email },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-base font-semibold text-slate-900 break-words">
                  {item.value || t('common.notAvailable', 'Not available')}
                </p>
              </div>
            ))}
          </div>
        </section>

      {/* Success/Error Messages */}
      {formError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{formError}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div>
        <nav className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'profile'
                ? 'bg-[#E39B34] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('profile.profileInfo', 'Profile Information')}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === 'password'
                ? 'bg-[#E39B34] text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('profile.changePassword', 'Change Password')}
          </button>
        </nav>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-2xl border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('profile.profileInfo', 'Profile Information')}
              </h2>
              <p className="text-sm text-slate-500">
                {t('profile.subtitle', 'Manage your account settings and preferences')}
              </p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 gap-6">
                {/* Salon Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {t('profile.salonInfo', 'Salon Information')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.salonName', 'Salon Name')}
                      </label>
                      <input
                        type="text"
                        value={profile?.salon?.name || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.planType', 'Plan Type')}
                      </label>
                      <input
                        type="text"
                        value={profile?.salon?.plan_type || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.phone', 'Phone')}
                      </label>
                      <input
                        type="text"
                        value={profile?.salon?.phone || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.city', 'City')}
                      </label>
                      <input
                        type="text"
                        value={profile?.salon?.city || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {t('profile.ownerInfo', 'Owner Information')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.email', 'Email Address')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange}
                        className={formInputClass}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#E39B34] text-white rounded-md hover:bg-[#cf8a2b] focus:outline-none focus:ring-2 focus:ring-[#E39B34] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? t('profile.updating', 'Updating...') : t('profile.updateProfile', 'Update Profile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white shadow rounded-2xl border border-slate-200">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('profile.changePassword', 'Change Password')}
            </h2>
            <p className="text-sm text-slate-500">
              {t('profile.passwordHint', 'Password must be at least 6 characters long')}
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handlePasswordSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.currentPassword', 'Current Password')}
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    className={formInputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.newPassword', 'New Password')}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={formInputClass}
                    required
                    minLength="6"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {t('profile.passwordHint', 'Password must be at least 6 characters long')}
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.confirmPassword', 'Confirm New Password')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={formInputClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-[#E39B34] text-white rounded-md hover:bg-[#cf8a2b] focus:outline-none focus:ring-2 focus:ring-[#E39B34] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? t('profile.changingPassword', 'Changing Password...') : t('profile.changePassword', 'Change Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
</section>
  );
};

export default ProfilePage;
