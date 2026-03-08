import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { getProject } from '@/shared/api/projects';
import { getMe } from '@/shared/api/me';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function ProjectView() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  

const [project, setProject] = useState<any | null>(null);
const [me, setMe] = useState<any | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let isMounted = true;
  (async () => {
    try {
      setLoading(true);
      const [pRes, meRes] = await Promise.all([
        projectId ? getProject(projectId) : Promise.resolve(null),
        getMe(),
      ]);
      if (!isMounted) return;
      setProject(pRes);
      setMe(meRes);
    } finally {
      if (isMounted) setLoading(false);
    }
  })();
  return () => {
    isMounted = false;
  };
}, [projectId]);

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-600">Loading project…</div>
    </div>
  );
}

if (!project) {

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Project not found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/')} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-600">{project.deviceName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {me?.name ?? 'Loading…'}
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">My Role</div>
                <Badge className="bg-gray-100 text-gray-700">{project.myRole}</Badge>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Current Phase</div>
                <Badge variant="outline">{project.phase}</Badge>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="text-gray-900">{project.status}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Open Issues</div>
                <div className="text-gray-900">{project.blockers}</div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Next Action</h3>
            <p className="text-gray-700">{project.primaryAction}</p>

            {projectId ? (
              <div className="mt-4">
                <Button onClick={() => navigate(`/projects/${projectId}/workflow/project-setup`)}>
                  Open workflow
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              Full project details, protocol sections, reports, and document management would be displayed here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
