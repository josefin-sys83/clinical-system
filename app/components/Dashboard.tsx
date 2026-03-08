import { useEffect, useMemo, useState } from 'react';
import { Plus, User, Filter, Settings, LogOut, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listProjects, listCompletedProjects } from '@/shared/api/projects';
import { listOpenItems } from '@/shared/api/openItems';
import { getMe } from '@/shared/api/me';
import { AIAssistant } from './AIAssistant';
import { NewProjectDialog } from './NewProjectDialog';
import { ProjectCard } from './ProjectCard';
import { ActionsByProject } from './ActionsByProject';
import { Button } from './ui/button';

type FilterMode = 'all' | 'signatures' | 'blockers' | 'review' | 'input-needed';

export function Dashboard() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

const [projects, setProjects] = useState<any[]>([]);
const [completedProjects, setCompletedProjects] = useState<any[]>([]);
const [openItems, setOpenItems] = useState<any[]>([]);
const [me, setMe] = useState<any | null>(null);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState<string | null>(null);

useEffect(() => {
  let isMounted = true;
  (async () => {
    try {
      setLoading(true);
      const [p1, p2, items, meRes] = await Promise.all([
        listProjects(),
        listCompletedProjects(),
        listOpenItems(),
        getMe(),
      ]);
      if (!isMounted) return;
      setProjects(p1);
      setCompletedProjects(p2);
      setOpenItems(items);
      setMe(meRes);
      setLoadError(null);
    } catch (e: any) {
      if (!isMounted) return;
      setLoadError(e?.message ?? 'Failed to load data');
    } finally {
      if (isMounted) setLoading(false);
    }
  })();
  return () => {
    isMounted = false;
  };
}, []);

// Backwards-compat aliases so the existing UI can stay unchanged.
const mockProjects = projects;
const mockCompletedProjects = completedProjects;
const mockOpenItems = openItems;
const currentUser = me ?? { name: 'Loading…', email: '' };


  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleItemClick = (link: string) => {
    alert(`Navigate to: ${link}\n\nIn a real application, this would route to the specific document section.`);
  };

  const handleNewProject = () => {
    window.open('https://www.figma.com/make/SW5alHc5jCLSdtGLbInkby/Project-Setup?t=WLzZ4Rnx6CIP9Fnp-0', '_blank');
  };

  // Filter items based on selected mode
  const filteredItems = useMemo(() => {
    const today = new Date('2026-02-16');
    
    let items = [...mockOpenItems];

    switch (filterMode) {
      case 'all':
        // Show all items
        break;
      case 'signatures':
        items = items.filter(item => String(item.action).toLowerCase() === 'input needed');
        break;
      case 'blockers':
        items = items.filter(item => {
          const project = mockProjects.find(p => p.id === item.projectId);
          return (project?.blockers || 0) > 0 && item.priority === 'High';
        });
        break;
      case 'review':
        items = items.filter(item => String(item.action).toLowerCase() === 'input needed');
        break;
      case 'input-needed':
        items = items.filter(item => String(item.action).toLowerCase() === 'input needed');
        break;
    }

    // Sort by urgency: Blockers > Due soon > Signatures > Rest
    return items.sort((a, b) => {
      // 1. Blockers first
      const aProject = mockProjects.find(p => p.id === a.projectId);
      const bProject = mockProjects.find(p => p.id === b.projectId);
      const aIsBlocker = (aProject?.blockers || 0) > 0 && a.priority === 'High';
      const bIsBlocker = (bProject?.blockers || 0) > 0 && b.priority === 'High';

      if (aIsBlocker && !bIsBlocker) return -1;
      if (!aIsBlocker && bIsBlocker) return 1;

      // 2. Then by due date urgency
      if (a.dueDate && b.dueDate) {
        const dateCompare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        if (dateCompare !== 0) return dateCompare;
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // 3. Then signatures
      const aIsSignature = a.action === 'Sign';
      const bIsSignature = b.action === 'Sign';
      if (aIsSignature && !bIsSignature) return -1;
      if (!aIsSignature && bIsSignature) return 1;

      // 4. Then by priority
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [filterMode]);

  const getFilterLabel = () => {
    switch (filterMode) {
      case 'all':
        return 'All My Actions';
      case 'signatures':
        return 'Awaiting My Signature';
      case 'blockers':
        return 'Blocking Issues';
      case 'review':
        return 'Review Needed';
      case 'input-needed':
        return 'Input Needed';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Clinical Investigation Platform
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleNewProject} className="gap-2 bg-blue-900 hover:bg-blue-950 text-white">
                <span className="text-lg leading-none">+</span>
                New Project
              </Button>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser.name}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <User className="h-4 w-4 text-white" />
                </button>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{currentUser.email}</div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            alert('Settings panel would open here');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-500" />
                          <span>Settings</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            alert('Notifications panel would open here');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Bell className="h-4 w-4 text-gray-500" />
                          <span>Notifications</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            alert('Compliance & Security panel would open here');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span>Compliance & Security</span>
                        </button>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="border-t border-gray-200 pt-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            alert('Logout would happen here');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 text-gray-500" />
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-8 py-8">
        {/* MY REQUIRED ACTIONS - Primary Section (First) */}
        <section className="mb-10">
          <div className="mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">My Required Actions</h2>
              <p className="text-sm text-gray-600 mt-1">
                Tasks that need my attention across all projects
              </p>
            </div>
            
            {/* Filter buttons - moved below title */}
            <div className="flex items-center gap-2 mt-4">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterMode === 'all'
                      ? 'bg-gray-200 text-gray-900 border border-gray-300 font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterMode('signatures')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterMode === 'signatures'
                      ? 'bg-gray-200 text-gray-900 border border-gray-300 font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Signatures
                </button>
                <button
                  onClick={() => setFilterMode('blockers')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterMode === 'blockers'
                      ? 'bg-gray-200 text-gray-900 border border-gray-300 font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Blockers
                </button>
                <button
                  onClick={() => setFilterMode('review')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterMode === 'review'
                      ? 'bg-gray-200 text-gray-900 border border-gray-300 font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={() => setFilterMode('input-needed')}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterMode === 'input-needed'
                      ? 'bg-gray-200 text-gray-900 border border-gray-300 font-semibold'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Input Needed
                </button>
              </div>
            </div>
          </div>

          {filteredItems.length > 0 ? (
            <ActionsByProject
              items={filteredItems}
              projects={mockProjects}
              onItemClick={handleItemClick}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No {filterMode !== 'all' ? getFilterLabel().toLowerCase() : 'actions'} at this time
              </p>
            </div>
          )}
        </section>

        {/* MY PROJECTS - Secondary Section */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">My Projects</h2>
            <p className="text-sm text-gray-600 mt-1">
              Projects where I have an active role
            </p>
          </div>

          {/* Active Projects */}
          <div className="space-y-4 mb-6">
            {mockProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewProject={handleProjectClick}
              />
            ))}
          </div>

          {/* Completed Projects */}
          {mockCompletedProjects.length > 0 && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-700">Completed Projects</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Recently finished studies
                </p>
              </div>
              <div className="space-y-4">
                {mockCompletedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewProject={handleProjectClick}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* New Project Dialog */}
      <NewProjectDialog
        open={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
      />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}