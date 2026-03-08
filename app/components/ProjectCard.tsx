import { ArrowRight } from 'lucide-react';
import { Project } from '../types/project';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ProjectCardProps {
  project: Project;
  onViewProject: (projectId: string) => void;
}

export function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'On track':
        return { dot: 'bg-green-600', text: 'text-gray-700', bg: 'bg-green-50' };
      case 'Complete':
        return { dot: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Delay':
        return { dot: 'bg-red-600', text: 'text-gray-700', bg: 'bg-red-50' };
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50' };
    }
  };

  const getRoleBadgeClass = (role: string) => {
    return 'bg-white text-gray-900 border border-gray-300';
  };

  const statusInfo = getStatusIndicator(project.status);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              {project.blockers > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-300 rounded text-xs font-medium text-red-800">
                  {project.blockers} blocker{project.blockers > 1 ? 's' : ''}
                </div>
              )}
              {project.warnings > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 border border-orange-300 rounded text-xs font-medium text-orange-800">
                  {project.warnings} warning{project.warnings > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            {project.deviceName}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {project.myRole.map((role, idx) => (
              <Badge key={idx} className={getRoleBadgeClass(role)} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          onClick={() => onViewProject(project.id)}
          className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 gap-2"
        >
          Go to project
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Phase:</span>
          <span className="text-sm font-medium text-gray-900">
            {project.phase}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <span className={`text-sm font-medium ${statusInfo.text}`}>
            {project.status}
          </span>
        </div>
      </div>

      {(project.blockerItems && project.blockerItems.length > 0) || (project.warningItems && project.warningItems.length > 0) ? (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {project.blockerItems?.map((blocker) => (
            <div key={blocker.id} className="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-md">
              <span className="text-sm font-medium text-red-900 whitespace-nowrap">Blocker:</span>
              <p className="text-sm text-gray-900 flex-1">{blocker.description}</p>
            </div>
          ))}
          {project.warningItems?.map((warning) => (
            <div key={warning.id} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-300 rounded-md">
              <span className="text-sm font-medium text-orange-900 whitespace-nowrap">Warning:</span>
              <p className="text-sm text-gray-900 flex-1">{warning.description}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm">
          <span className="text-gray-500">Next action: </span>
          <span className="text-gray-900 font-medium">{project.primaryAction}</span>
        </div>
      </div>
    </div>
  );
}