import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import APIService from "../../services/APIService";
import { useAuth } from "../../hooks/useAuth";
import "./SettingsPage.css";

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
    },
    notifications: {
      emailNotifications: true,
      assignmentReminders: true,
      submissionAlerts: true,
    },
    preferences: {
      theme: 'light',
      language: 'ko',
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // TODO: 백엔드에서 설정 불러오기
    // fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: 백엔드 API 연동
      // await APIService.updateSettings(settings);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="settings-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">시스템 설정</h1>
        </div>

        <div className="settings-content">
          {/* 프로필 설정 */}
          <div className="settings-section">
            <h2 className="settings-section-title">프로필 설정</h2>
            <div className="settings-form">
              <div className="admin-form-group">
                <label htmlFor="profile-name">이름</label>
                <input
                  id="profile-name"
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => handleChange('profile', 'name', e.target.value)}
                  className="admin-form-input"
                  disabled
                />
                <p className="form-help-text">이름 변경은 관리자에게 문의하세요.</p>
              </div>
              <div className="admin-form-group">
                <label htmlFor="profile-email">이메일</label>
                <input
                  id="profile-email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleChange('profile', 'email', e.target.value)}
                  className="admin-form-input"
                  disabled
                />
                <p className="form-help-text">이메일 변경은 관리자에게 문의하세요.</p>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="settings-section">
            <h2 className="settings-section-title">알림 설정</h2>
            <div className="settings-form">
              <div className="settings-checkbox-group">
                <label className="settings-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>이메일 알림 받기</span>
                </label>
              </div>
              <div className="settings-checkbox-group">
                <label className="settings-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.assignmentReminders}
                    onChange={(e) => handleChange('notifications', 'assignmentReminders', e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>과제 마감 알림</span>
                </label>
              </div>
              <div className="settings-checkbox-group">
                <label className="settings-checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.submissionAlerts}
                    onChange={(e) => handleChange('notifications', 'submissionAlerts', e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>제출 알림</span>
                </label>
              </div>
            </div>
          </div>

          {/* 환경 설정 */}
          <div className="settings-section">
            <h2 className="settings-section-title">환경 설정</h2>
            <div className="settings-form">
              <div className="admin-form-group">
                <label htmlFor="theme">테마</label>
                <select
                  id="theme"
                  value={settings.preferences.theme}
                  onChange={(e) => handleChange('preferences', 'theme', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="light">라이트</option>
                  <option value="dark">다크</option>
                  <option value="auto">시스템 설정 따르기</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label htmlFor="language">언어</label>
                <select
                  id="language"
                  value={settings.preferences.language}
                  onChange={(e) => handleChange('preferences', 'language', e.target.value)}
                  className="admin-form-select"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* DOMjudge 연동 상태 */}
          <div className="settings-section">
            <h2 className="settings-section-title">DOMjudge 연동 상태</h2>
            <div className="settings-info-box">
              <p>DOMjudge 연동 설정은 시스템 관리자에게 문의하세요.</p>
              <div className="settings-status">
                <span className="status-indicator status-active"></span>
                <span>연동 중</span>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="settings-actions">
            <button 
              className="admin-btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;

