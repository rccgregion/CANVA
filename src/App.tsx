/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { REAProvider, useREA } from './context/REAContext';
import { TopBar } from './components/layout/TopBar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { ChatMode } from './components/workspace/ChatMode';
import { InvestigationMode } from './components/workspace/InvestigationMode';
import { CanvaClone } from './components/clones/CanvaClone';
import { CanvaHome } from './components/clones/CanvaHome';
import { CanvaSpecAndTests } from './components/clones/CanvaSpecAndTests';
import { NeonmorphicClone } from './components/clones/NeonmorphicClone';
import { LinearClone } from './components/clones/LinearClone';
import { EvidencePanel } from './components/panels/EvidencePanel';
import { NewInvestigationModal } from './components/modals/NewInvestigationModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { DeepImproveModal } from './components/modals/DeepImproveModal';

const DashboardContent: React.FC = () => {
  const { workspaceMode } = useREA();

  const isPureCanvaMode = workspaceMode === 'canva' || workspaceMode === 'canva_home';

  if (isPureCanvaMode) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#f3f4f7] text-slate-900 overflow-hidden font-sans">
        {workspaceMode === 'canva_home' ? <CanvaHome /> : <CanvaClone />}
        <NewInvestigationModal />
        <SettingsModal />
        <DeepImproveModal />
      </div>
    );
  }

  const renderMainWorkspace = () => {
    switch (workspaceMode) {
      case 'spec_tests':
        return <CanvaSpecAndTests />;
      case 'neonmorphic':
        return <NeonmorphicClone />;
      case 'linear':
        return <LinearClone />;
      case 'investigation':
        return <InvestigationMode />;
      case 'chat':
      default:
        return <ChatMode />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07080f] text-slate-100 overflow-hidden font-sans">
      <TopBar />

      <div className="flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {renderMainWorkspace()}
        </main>
        <EvidencePanel />
      </div>

      <NewInvestigationModal />
      <SettingsModal />
      <DeepImproveModal />
    </div>
  );
};

export default function App() {
  return (
    <REAProvider>
      <DashboardContent />
    </REAProvider>
  );
}
