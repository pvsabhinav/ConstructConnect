// Shared messaging service to connect photo reports with messaging channels
class MessagingService {
  private static instance: MessagingService;
  private projects: any[] = [];
  private setProjects: ((projects: any[]) => void) | null = null;
  private currentProjectId: string | null = null;

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  // Register the projects state and setter from MessagingScreen
  registerProjectsState(projects: any[], setProjects: (projects: any[]) => void) {
    this.projects = projects;
    this.setProjects = setProjects;
  }

  // Set the current project ID
  setCurrentProject(projectId: string | null) {
    this.currentProjectId = projectId;
    console.log('MessagingService: Current project set to:', projectId);
  }

  // Get the current project ID
  getCurrentProject(): string | null {
    return this.currentProjectId;
  }

  // Post a photo report to a specific channel
  postPhotoReportToChannel(channelType: 'issues' | 'updates', report: any, projectId?: string) {
    if (!this.setProjects) {
      console.error('MessagingService not initialized');
      return;
    }

    // Use the current project ID if no project ID is specified
    const targetProjectId = projectId || this.currentProjectId;
    
    if (!targetProjectId) {
      console.error('No project selected for photo report');
      return;
    }

    // Find the target project
    const targetProject = this.projects.find(p => p.id === targetProjectId);

    if (!targetProject) {
      console.error(`Project with ID ${targetProjectId} not found`);
      return;
    }

    // Find the target channel
    const targetChannel = targetProject.channels.find((ch: any) => {
      if (channelType === 'issues') {
        return ch.type === 'issues';
      } else if (channelType === 'updates') {
        return ch.type === 'updates';
      }
      return false;
    });

    if (!targetChannel) {
      console.error(`Channel type ${channelType} not found`);
      return;
    }

    // Create the photo report message
    const newMessage = {
      id: Date.now().toString(),
      content: '',
      type: 'photo-report' as const,
      senderId: 'ai-system',
      senderName: 'AI Assistant',
      timestamp: new Date(),
      channelId: targetChannel.id,
      photoReport: report,
    };

    // Update projects state
    this.setProjects(prev => prev.map(project => {
      if (project.id === targetProject.id) {
        return {
          ...project,
          channels: project.channels.map((channel: any) => {
            if (channel.id === targetChannel.id) {
              return {
                ...channel,
                messages: [...channel.messages, newMessage]
              };
            }
            return channel;
          })
        };
      }
      return project;
    }));

    console.log(`Posted photo report to ${channelType} channel:`, newMessage);
  }

  // Get current projects for debugging
  getProjects() {
    return this.projects;
  }
}

export default MessagingService;
