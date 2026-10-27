import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveKpiCards } from './components/dashboard/ExecutiveKpiCards';
import { ExecutiveCharts } from './components/dashboard/ExecutiveCharts';
import { PriorityProjectsTable } from './components/dashboard/PriorityProjectsTable';
import { ProjectsView } from './components/projects/ProjectsView';
import { ScheduleAndTasksUnifiedView } from './components/schedule/ScheduleAndTasksUnifiedView';
import { FinancialOverview } from './components/financial/FinancialOverview';
import { RiskMatrix } from './components/risks/RiskMatrix';
import { ExecutiveReports } from './components/reports/ExecutiveReports';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsAndUsersView } from './components/settings/SettingsAndUsersView';
import { GenerationPipelineView } from './components/generation/GenerationPipelineView';
import { ExecutivePredictiveInsights } from './components/dashboard/ExecutivePredictiveInsights';
import { ExecutiveApprovalsView } from './components/approvals/ExecutiveApprovalsView';
import { GovernmentalProjectsView } from './components/governmental/GovernmentalProjectsView';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { EdmAiCopilotModal } from './components/ai/EdmAiCopilotModal';
import { LoginPage } from './components/auth/LoginPage';
import { Project } from './types';
import { Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    selectedProjectId,
    setSelectedProjectId,
    projects,
    isAiCopilotOpen,
    openAiCopilot,
    closeAiCopilot,
    aiCopilotInitialPrompt,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleOpenEdit = (project: Project) => {
    setProjectToEdit(project);
    setShowCreateModal(true);
  };

  const handleEditFromDetail = () => {
    const cur = projects.find(p => p.id === selectedProjectId);
    if (cur) {
      setProjectToEdit(cur);
      setShowCreateModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header spanning 100% full width */}
      <Header
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main Body: Left-docked Collapsible Sidebar + Right Content */}
      <div className="flex-1 flex w-full min-w-0">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <ExecutiveKpiCards />
              <ExecutivePredictiveInsights />
              <ExecutiveCharts />
              <PriorityProjectsTable
                onOpenCreateModal={() => {
                  setProjectToEdit(null);
                  setShowCreateModal(true);
                }}
              />
            </div>
          )}

          {activeTab === 'governmental' && <GovernmentalProjectsView />}

          {activeTab === 'approvals' && <ExecutiveApprovalsView />}

          {activeTab === 'projects' && (
            <ProjectsView
              onOpenCreateModal={() => {
                setProjectToEdit(null);
                setShowCreateModal(true);
              }}
              onOpenEditModal={handleOpenEdit}
            />
          )}

          {activeTab === 'generation' && <GenerationPipelineView />}

          {(activeTab === 'schedule' || activeTab === 'activities') && (
            <ScheduleAndTasksUnifiedView />
          )}

          {activeTab === 'financial' && <FinancialOverview />}

          {activeTab === 'risks' && <RiskMatrix />}

          {activeTab === 'reports' && <ExecutiveReports />}

          {activeTab === 'audit' && <AuditLogView />}

          {activeTab === 'settings' && <SettingsAndUsersView />}
        </main>
      </div>

      {/* Global Executive Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-3 px-4 sm:px-8 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 z-10 select-none">
        <div className="flex items-center gap-2">
          <img src="/logo-edm.webp" alt="EDM" className="h-4.5 w-auto object-contain opacity-85" />
          <span className="font-bold text-slate-800">Electricidade de Moçambique, E.P.</span>
          <span className="hidden md:inline text-slate-400">• Portal Integrado de Gestão e Monitorização de Projectos</span>
        </div>
        <a
          href="https://www.muv.co.mz/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-50 hover:bg-white px-4 py-1.5 rounded-full border border-slate-200 hover:border-orange-300 shadow-2xs hover:shadow-xs transition select-none group cursor-pointer"
          title="Visitar MUV Educação & Engenharia (https://www.muv.co.mz/)"
        >
          <span className="text-[10px] font-black text-slate-400 group-hover:text-[#002D62] uppercase tracking-wider transition">
            Powered by
          </span>
          <img
            src="/muv logo.png"
            alt="MUV Educação & Engenharia"
            className="h-7 sm:h-8 w-auto object-contain group-hover:scale-105 transition drop-shadow-2xs"
          />
        </a>
      </footer>

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <ProjectDetailModal
          onClose={() => setSelectedProjectId(null)}
          onEdit={handleEditFromDetail}
        />
      )}

      {/* Project Form Modal (Create / Edit) */}
      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
      />

      {/* EDM AI Copilot Modal / Compact Top Floating Widget */}
      <EdmAiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={closeAiCopilot}
        initialPrompt={aiCopilotInitialPrompt}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
