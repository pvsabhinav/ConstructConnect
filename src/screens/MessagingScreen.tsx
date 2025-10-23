import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/global';
import WorkspaceSelector from '../components/WorkspaceSelector';
import VoiceMessagePlayer from '../components/VoiceMessagePlayer';
import MessagingService from '../services/messagingService';

const { width } = Dimensions.get('window');

// Types
interface Project {
  id: string;
  name: string;
  projectId: string;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  type: 'general' | 'updates' | 'issues' | 'safety' | 'custom';
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'system' | 'photo-report';
  senderId: string;
  senderName: string;
  timestamp: Date;
  channelId: string;
  threadId?: string;
  replies?: Message[];
  photoReport?: any;
}

interface Thread {
  id: string;
  messageId: string;
  channelId: string;
  messages: Message[];
}

export default function MessagingScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [sidebarAnimation] = useState(new Animated.Value(1));
  const [refreshKey, setRefreshKey] = useState(0);

  // Computed values - always derive from projects state
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;
  const selectedChannel = selectedProject?.channels.find(c => c.id === selectedChannelId) || null;

  // Sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Downtown Office Building',
        projectId: 'PROJ-001',
        channels: [
          {
            id: '1',
            name: 'general',
            type: 'general',
            messages: [],
          },
          {
            id: '2',
            name: 'issues',
            type: 'issues',
            messages: [],
          },
          {
            id: '3',
            name: 'progress',
            type: 'updates',
            messages: [],
          },
        ],
      },
    ];
    setProjects(sampleProjects);
    setSelectedProjectId(sampleProjects[0].id);
    setSelectedChannelId(sampleProjects[0].channels[0].id);
    
    // Register with messaging service
    const messagingService = MessagingService.getInstance();
    messagingService.registerProjectsState(sampleProjects, setProjects);
  }, []);

  // Update messaging service when projects change
  useEffect(() => {
    const messagingService = MessagingService.getInstance();
    messagingService.registerProjectsState(projects, setProjects);
  }, [projects]);

  // Update messaging service when current project changes
  useEffect(() => {
    const messagingService = MessagingService.getInstance();
    messagingService.setCurrentProject(selectedProjectId);
  }, [selectedProjectId]);



  const toggleSidebar = () => {
    const toValue = showSidebar ? 0 : 1;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 150,
      useNativeDriver: false,
    }).start(() => {
      // Hide sidebar completely after animation
      if (showSidebar) {
        setShowSidebar(false);
      }
    });
    if (!showSidebar) {
      setShowSidebar(true);
    }
  };

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      console.log('Pan gesture ended:', { translationX, velocityX, showSidebar });
      
      // Swipe left to hide sidebar
      if (translationX < -30 || velocityX < -200) {
        if (showSidebar) {
          console.log('Hiding sidebar via swipe');
          toggleSidebar();
        }
      }
      // Swipe right to show sidebar
      else if (translationX > 30 || velocityX > 200) {
        if (!showSidebar) {
          console.log('Showing sidebar via swipe');
          toggleSidebar();
        }
      }
    }
  };

  const getChannelColor = (type: Channel['type']) => {
    switch (type) {
      case 'general': return theme.colors.channelGeneral;
      case 'updates': return theme.colors.channelUpdates;
      case 'issues': return theme.colors.channelIssues;
      case 'safety': return theme.colors.channelSafety;
      default: return theme.colors.textSecondary;
    }
  };

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'general': return 'chatbubbles';
      case 'updates': return 'trending-up';
      case 'issues': return 'warning';
      case 'safety': return 'shield-checkmark';
      default: return 'chatbubble';
    }
  };



  const sendMessage = () => {
    if (!messageInput.trim() || !selectedChannelId || !selectedProjectId) {
      console.log('Cannot send message:', { messageInput: messageInput.trim(), selectedChannelId, selectedProjectId });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      type: 'text',
      senderId: 'user1',
      senderName: 'You',
      timestamp: new Date(),
      channelId: selectedChannelId,
    };

    console.log('Sending message:', newMessage);

    setProjects(prev => {
      const updated = prev.map(project => {
        if (project.id === selectedProjectId) {
          return {
            ...project,
            channels: project.channels.map(channel => {
              if (channel.id === selectedChannelId) {
                const updatedChannel = { ...channel, messages: [...channel.messages, newMessage] };
                console.log('Updated channel:', updatedChannel);
                return updatedChannel;
              }
              return channel;
            })
          };
        }
        return project;
      });
      console.log('Updated projects:', updated);
      setRefreshKey(prev => prev + 1);
      return updated;
    });

    setMessageInput('');
  };

  const createChannel = () => {
    if (!newChannelName.trim() || !selectedProjectId) return;

    const newChannel: Channel = {
      id: Date.now().toString(),
      name: newChannelName.trim().toLowerCase(),
      type: 'custom',
      messages: [],
    };

    setProjects(prev => prev.map(project => 
      project.id === selectedProjectId
        ? { ...project, channels: [...project.channels, newChannel] }
        : project
    ));

    setNewChannelName('');
    setShowNewChannelModal(false);
    setSelectedChannelId(newChannel.id);
  };

  const createProject = (name: string, projectId: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      projectId,
      channels: [
        {
          id: Date.now().toString() + '_general',
          name: 'general',
          type: 'general',
          messages: [],
        },
        {
          id: Date.now().toString() + '_issues',
          name: 'issues',
          type: 'issues',
          messages: [],
        },
        {
          id: Date.now().toString() + '_progress',
          name: 'progress',
          type: 'updates',
          messages: [],
        },
      ],
    };
    
    setProjects(prev => [...prev, newProject]);
    setSelectedProjectId(newProject.id);
    setSelectedChannelId(newProject.channels[0].id);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === 'user1';
    const isSystem = item.type === 'system';

    return (
      <View style={[
        styles.messageContainer,
        isOwn && styles.ownMessageContainer,
        isSystem && styles.systemMessage
      ]}>
        {!isOwn && !isSystem && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwn && styles.ownMessageBubble,
          isSystem && styles.systemMessageBubble
        ]}>
          {item.type === 'voice' ? (
            <VoiceMessagePlayer
              uri={item.content}
              senderName={isOwn ? undefined : item.senderName}
              timestamp={item.timestamp}
            />
          ) : item.type === 'photo-report' ? (
            <View style={styles.photoReportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportTypeContainer}>
                  <Ionicons 
                    name={item.photoReport?.type === 'progress' ? 'trending-up' : 'warning'} 
                    size={20} 
                    color={item.photoReport?.type === 'progress' ? theme.colors.success : theme.colors.error} 
                  />
                  <Text style={[
                    styles.reportType,
                    { color: item.photoReport?.type === 'progress' ? theme.colors.success : theme.colors.error }
                  ]}>
                    {item.photoReport?.type === 'progress' ? 'Progress Report' : 'Issue Report'}
                  </Text>
                </View>
                <Text style={styles.reportTimestamp}>
                  {item.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <Image source={{ uri: item.photoReport?.imageUri }} style={styles.reportImage} />
              
              {item.photoReport?.description && (
                <Text style={styles.description}>{item.photoReport.description}</Text>
              )}
              
              <View style={styles.aiReportContainer}>
                <Text style={styles.aiReportTitle}>AI Analysis:</Text>
                <Text style={styles.aiReportText}>{item.photoReport?.aiReport}</Text>
              </View>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isOwn && styles.ownMessageText,
              isSystem && styles.systemMessageText
            ]}>
              {item.content}
            </Text>
          )}
        </View>
        <Text style={[
          styles.timestamp,
          isOwn && styles.ownTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >

      <PanGestureHandler
        onHandlerStateChange={onPanHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-5, 5]}
      >
        <View style={styles.content}>
          {/* Sidebar Overlay */}
          {showSidebar && (
            <Animated.View 
              style={[
                styles.sidebarOverlay,
                {
                  opacity: sidebarAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }
              ]}
            >
            {/* Discord-style Header */}
            <View style={styles.sidebarHeader}>
              <TouchableOpacity
                style={styles.projectSelector}
                onPress={() => setShowProjectModal(true)}
              >
                <View style={styles.workspaceInfo}>
                  <View style={styles.workspaceIcon}>
                    <Ionicons name="business" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.workspaceDetails}>
                    <Text style={styles.workspaceName}>{selectedProject?.name}</Text>
                    <Text style={styles.workspaceId}>{selectedProject?.projectId}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addChannelButton}
                onPress={() => setShowNewChannelModal(true)}
              >
                <Ionicons name="add" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Discord-style Channel Categories */}
            <View style={styles.channelCategory}>
              <View style={styles.categoryHeader}>
                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.categoryTitle}>CHANNELS</Text>
              </View>
              
              <ScrollView style={styles.channelList} showsVerticalScrollIndicator={false}>
                {selectedProject?.channels.map((channel) => (
                  <TouchableOpacity
                    key={channel.id}
                    style={[
                      styles.channelItem,
                      selectedChannel?.id === channel.id && styles.selectedChannelItem,
                    ]}
                    onPress={() => setSelectedChannelId(channel.id)}
                  >
                    <Ionicons 
                      name={getChannelIcon(channel.type) as any} 
                      size={16} 
                      color={selectedChannel?.id === channel.id ? theme.colors.text : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.channelText,
                      selectedChannel?.id === channel.id && styles.selectedChannelText
                    ]}>
                      {channel.name}
                    </Text>
                    {channel.messages.length > 0 && (
                      <View style={styles.messageCount}>
                        <Text style={styles.messageCountText}>{channel.messages.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            </Animated.View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={toggleSidebar}
            >
              <Ionicons name="menu" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.channelName}>
                #{selectedChannel?.name || 'Select Channel'}
              </Text>
              <Text style={styles.channelDescription}>
                {selectedChannel?.type === 'general' && 'General discussion'}
                {selectedChannel?.type === 'updates' && 'Project progress and updates'}
                {selectedChannel?.type === 'issues' && 'Report issues and problems'}
                {selectedChannel?.type === 'custom' && 'Custom channel'}
              </Text>
            </View>
            {!showSidebar && (
              <View style={styles.swipeHintContainer}>
                <Text style={styles.swipeHint}>Swipe right or tap to show channels</Text>
              </View>
            )}
          </View>

          {/* Messages */}
          <View style={styles.messagesContainer}>
            <PanGestureHandler
              onHandlerStateChange={onPanHandlerStateChange}
              activeOffsetX={[-10, 10]}
              failOffsetY={[-5, 5]}
            >
              <View style={styles.messagesWrapper}>
                <FlatList
                  key={refreshKey}
                  data={selectedChannel?.messages || []}
                  renderItem={renderMessage}
                  keyExtractor={(item) => item.id}
                  style={styles.messagesList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.messagesContent}
                  extraData={selectedChannel?.messages?.length}
                  onContentSizeChange={() => console.log('FlatList content size changed')}
                />
              </View>
            </PanGestureHandler>
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={messageInput}
              onChangeText={setMessageInput}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageInput.trim() && styles.disabledButton
              ]}
              onPress={sendMessage}
              disabled={!messageInput.trim()}
            >
              <Ionicons name="send" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </PanGestureHandler>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <Text style={styles.modalTitle}>Create New Channel</Text>
            <TextInput
              style={styles.modalInput}
              value={newChannelName}
              onChangeText={setNewChannelName}
              placeholder="Channel name"
              placeholderTextColor={theme.colors.textMuted}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowNewChannelModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={createChannel}
                disabled={!newChannelName.trim()}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Project Selector Modal */}
      {showProjectModal && (
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <Text style={styles.modalTitle}>Select Project</Text>
            
            <ScrollView style={styles.projectList} showsVerticalScrollIndicator={false}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectItem,
                    selectedProject?.id === project.id && styles.selectedProjectItem
                  ]}
                  onPress={() => {
                    setSelectedProjectId(project.id);
                    setSelectedChannelId(project.channels[0].id);
                    setShowProjectModal(false);
                  }}
                >
                  <View style={styles.projectItemContent}>
                    <View style={styles.projectIcon}>
                      <Ionicons name="business" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.projectDetails}>
                      <Text style={styles.projectItemName}>{project.name}</Text>
                      <Text style={styles.projectItemId}>{project.projectId}</Text>
                    </View>
                    {selectedProject?.id === project.id && (
                      <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.createSection}>
              <Text style={styles.createTitle}>Create New Project</Text>
              <TextInput
                style={styles.modalInput}
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder="Project name"
                placeholderTextColor={theme.colors.textMuted}
              />
              <TextInput
                style={styles.modalInput}
                value={newProjectId}
                onChangeText={setNewProjectId}
                placeholder="Project ID"
                placeholderTextColor={theme.colors.textMuted}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowProjectModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={() => {
                    if (newProjectName.trim() && newProjectId.trim()) {
                      createProject(newProjectName.trim(), newProjectId.trim());
                      setNewProjectName('');
                      setNewProjectId('');
                      setShowProjectModal(false);
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    zIndex: 1000,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  projectSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: theme.spacing.sm,
  },
  workspaceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workspaceIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  workspaceDetails: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  workspaceId: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addChannelButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelCategory: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  channelList: {
    flex: 1,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  selectedChannelItem: {
    backgroundColor: theme.colors.primary + '15',
  },
  channelText: {
    marginLeft: theme.spacing.sm,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    flex: 1,
  },
  selectedChannelText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  messageCount: {
    backgroundColor: theme.colors.textSecondary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  messageCountText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuButton: {
    marginRight: theme.spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  channelDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  systemMessage: {
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.messageOther,
  },
  ownMessageBubble: {
    backgroundColor: theme.colors.messageOwn,
  },
  systemMessageBubble: {
    backgroundColor: theme.colors.messageSystem,
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  ownMessageText: {
    color: theme.colors.text,
  },
  systemMessageText: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  ownTimestamp: {
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.textMuted,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  swipeHintContainer: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  projectList: {
    maxHeight: 200,
  },
  projectItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedProjectItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  projectItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  projectDetails: {
    flex: 1,
  },
  projectItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  projectItemId: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  createSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  photoReportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  reportTimestamp: {
    fontSize: 11,
    color: theme.colors.textMuted,
    flexShrink: 0,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  reportImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontStyle: 'italic',
  },
  aiReportContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  aiReportTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  aiReportText: {
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
});