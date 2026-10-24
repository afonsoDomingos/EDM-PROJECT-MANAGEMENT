import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveKpiCards } from './components/dashboard/ExecutiveKpiCards';
import { ExecutiveCharts } from './components/dashboard/ExecutiveCharts';
import { PriorityProjectsTable } from './components/dashboard/PriorityProjectsTable';
import { ProjectsView } from './components/projects/ProjectsView';
import { ScheduleGanttView } from './components/schedule/ScheduleGanttView';
import { ActivitiesKanban } from './components/activities/ActivitiesKanban';
import { FinancialOverview } from './components/financial/FinancialOverview';
import { RiskMatrix } from './components/risks/RiskMatrix';
import { ExecutiveReports } from './components/reports/ExecutiveReports';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsAndUsersView } from './components/settings/SettingsAndUsersView';
import { GenerationPipelineView } from './components/generation/GenerationPipelineView';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { Project } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, selectedProjectId, setSelectedProjectId, projects } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Top Header */}
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* Main Container */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <ExecutiveKpiCards />
              <ExecutiveCharts />
              <PriorityProjectsTable
                onOpenCreateModal={() => {
                  setProjectToEdit(null);
                  setShowCreateModal(true);
                }}
              />
            </div>
          )}

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

          {activeTab === 'schedule' && <ScheduleGanttView />}

          {activeTab === 'activities' && <ActivitiesKanban />}

          {activeTab === 'financial' && <FinancialOverview />}

          {activeTab === 'risks' && <RiskMatrix />}

          {activeTab === 'reports' && <ExecutiveReports />}

          {activeTab === 'audit' && <AuditLogView />}

          {activeTab === 'settings' && <SettingsAndUsersView />}
        </main>
      </div>

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
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
