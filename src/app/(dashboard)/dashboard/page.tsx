'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboardStore, DashboardTab } from '../../../store/use-dashboard-store';
import { Loader2 } from 'lucide-react';

// Import subcomponents
import { OverviewTab } from '../../../components/dashboard/overview-tab';
import { CampaignsTab } from '../../../components/dashboard/campaigns-tab';
import { CustomersTab } from '../../../components/dashboard/customers-tab';
import { TemplatesTab } from '../../../components/dashboard/templates-tab';
import { SenderTab } from '../../../components/dashboard/sender-tab';
import { AnalyticsTab } from '../../../components/dashboard/analytics-tab';
import { QueueStatusTab } from '../../../components/dashboard/queue-status-tab';
import { SettingsTab } from '../../../components/dashboard/settings-tab';
import { FlowsTab } from '../../../components/dashboard/flows-tab';
import { OrdersTab } from '../../../components/dashboard/orders-tab';

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get('tab');
  const { activeTab, setActiveTab } = useDashboardStore();

  // Sync url param ?tab=... to activeTab store state
  useEffect(() => {
    if (tabQuery) {
      // Validate tab
      const validTabs: DashboardTab[] = [
        'dashboard',
        'campaigns',
        'customers',
        'contacts',
        'templates',
        'sender',
        'analytics',
        'queue',
        'settings',
        'flows',
        'orders'
      ];
      if (validTabs.includes(tabQuery as DashboardTab)) {
        // Automatically route legacy contacts requests to customers tab
        if (tabQuery === 'contacts') {
          setActiveTab('customers');
        } else {
          setActiveTab(tabQuery as DashboardTab);
        }
      }
    }
  }, [tabQuery, setActiveTab]);

  // Render correct tab view dynamically
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewTab />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'customers':
      case 'contacts':
        return <CustomersTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'sender':
        return <SenderTab />;
      case 'flows':
        return <FlowsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'queue':
        return <QueueStatusTab />;
      case 'settings':
        return <SettingsTab />;
      case 'orders':
        return <OrdersTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {renderTabContent()}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-medium">Loading Workspace Dashboard View...</p>
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
