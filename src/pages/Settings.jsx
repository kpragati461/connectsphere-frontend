import { useState } from 'react';
import { Shield, Palette, Lock, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BlockedUsersSection from '../components/settings/BlockedUsersSection';
import ProfilePersonalizationSection from '../components/settings/ProfilePersonalizationSection';
import ChangePasswordSection from '../components/settings/ChangePasswordSection';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'blocked', label: 'Blocked Users', icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '24px', maxWidth: '860px' }}>
      {/* Tab list */}
      <div style={{ width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', border: 'none',
              background: activeTab === key ? 'var(--accent-light)' : 'transparent',
              color: activeTab === key ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: activeTab === key ? '600' : '400',
              fontSize: '14px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="card" style={{ flex: 1, padding: '24px', minHeight: '400px' }}>
        {activeTab === 'profile' && <ProfilePersonalizationSection />}
        {activeTab === 'appearance' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
              Appearance
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {theme === 'light' ? 'Light mode' : 'Dark mode'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Switch between light and dark theme
                </div>
              </div>
              <button
                onClick={toggleTheme}
                style={{
                  padding: '7px 16px', borderRadius: '8px', border: '1px solid var(--border)',
                  background: 'var(--bg-hover)', color: 'var(--text-primary)',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Switch to {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
          </div>
        )}
        {activeTab === 'password' && <ChangePasswordSection />}
        {activeTab === 'blocked' && <BlockedUsersSection />}
      </div>
    </div>
  );
}