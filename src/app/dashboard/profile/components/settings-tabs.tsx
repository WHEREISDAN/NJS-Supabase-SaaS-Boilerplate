"use client";

import { useState } from 'react';
import ProfileForm from './profile-form';
import SubscriptionTab from './subscription-tab';
import { Subscription } from '@/types/subscription';

interface SettingsTabsProps {
  userId: string;
  email: string;
  initialFullName: string;
  initialWebsite: string;
  avatarUrl: string;
  subscription: Subscription | null;
}

export default function SettingsTabs({ 
  userId, 
  email, 
  initialFullName, 
  initialWebsite, 
  avatarUrl,
  subscription
}: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div>
      <div className="tabs tabs-box mb-6 max-w-[200px]">
        <a 
          className={`tab tab-lg ${activeTab === 'general' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </a>
        <a 
          className={`tab tab-lg ${activeTab === 'subscription' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription
        </a>
      </div>

      {activeTab === 'general' && (
        <ProfileForm 
          userId={userId} 
          email={email} 
          initialFullName={initialFullName} 
          initialWebsite={initialWebsite} 
          avatarUrl={avatarUrl}
        />
      )}

      {activeTab === 'subscription' && (
        <SubscriptionTab subscription={subscription} />
      )}
    </div>
  );
} 