import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { globalStyles } from '../styles/global';
import AIService from '../services/aiService';
import MessagingService from '../services/messagingService';

interface PhotoReport {
  id: string;
  imageUri: string;
  type: 'progress' | 'issue';
  description: string;
  aiReport: string;
  timestamp: Date;
  location?: string;
  tags: string[];
  projectId: string;
}

export default function PhotoReportingScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'progress' | 'issue'>('progress');
  const [description, setDescription] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reports, setReports] = useState<PhotoReport[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // Filter reports to show only current project's reports
  const currentProjectReports = reports.filter(report => 
    currentProjectId ? report.projectId === currentProjectId : false
  );

  // Track current project from MessagingService
  useEffect(() => {
    const messagingService = MessagingService.getInstance();
    const checkCurrentProject = () => {
      const projectId = messagingService.getCurrentProject();
      if (projectId !== currentProjectId) {
        setCurrentProjectId(projectId);
        console.log('PhotoReportingScreen: Current project updated to:', projectId);
      }
    };

    // Check immediately
    checkCurrentProject();

    // Set up interval to check for project changes
    const interval = setInterval(checkCurrentProject, 1000);

    return () => clearInterval(interval);
  }, [currentProjectId]);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        console.log('Taking picture...');
        const photo = await cameraRef.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        console.log('Picture taken:', photo.uri);
        setCapturedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', `Failed to take picture: ${error.message || 'Unknown error'}`);
      }
    } else {
      console.error('Camera ref is null');
      Alert.alert('Error', 'Camera not ready');
    }
  };

  const generateAIReport = async (imageUri: string, type: 'progress' | 'issue') => {
    setIsGeneratingReport(true);
    
    try {
      const aiService = new AIService();
      const analysis = await aiService.analyzePhoto(imageUri, type);
      
      setIsGeneratingReport(false);
      return {
        analysis
      };
    } catch (error) {
      setIsGeneratingReport(false);
      throw error;
    }
  };

  const submitReport = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please take a picture first');
      return;
    }

    if (isSubmitting) {
      return; // Prevent double submission
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting report:', { capturedImage, reportType, description });
      setIsGeneratingReport(true);
      const { analysis } = await generateAIReport(capturedImage, reportType);
      setIsGeneratingReport(false);
      
      const newReport: PhotoReport = {
        id: Date.now().toString(),
        imageUri: capturedImage,
        type: reportType,
        description: description.trim() || 'No description provided',
        aiReport: analysis.description,
        timestamp: new Date(),
        tags: reportType === 'progress' ? ['progress', 'construction'] : ['issue', 'safety'],
        projectId: currentProjectId || 'unknown',
      };

      console.log('Created report:', newReport);
      setReports(prev => [newReport, ...prev]);
      
      // Auto-post to appropriate channel based on report type
      const targetChannelType = reportType === 'issue' ? 'issues' : 'updates';
      const messagingService = MessagingService.getInstance();
      messagingService.postPhotoReportToChannel(targetChannelType, newReport, currentProjectId);
      
      // Reset form
      setCapturedImage(null);
      setDescription('');
      setReportType('progress');
      
      Alert.alert(
        'Report Submitted',
        `Your photo report has been submitted and an AI-generated analysis has been created. It has been automatically posted to the ${reportType === 'issue' ? 'issues' : 'progress'} channel${currentProjectId ? ` in the current project` : ''}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Submit report error:', error);
      Alert.alert('Error', `Failed to generate report: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setIsGeneratingReport(false);
    }
  };

  const postToUpdatesChannel = async (message: string, imageUri: string, channelType: string = 'updates') => {
    // This would normally post to the updates channel
    // For now, we'll just log it
    console.log(`Posting to ${channelType} channel:`, message);
    
    // In a real app, you would:
    // 1. Find the updates channel
    // 2. Create a message with the AI analysis
    // 3. Add the image attachment
    // 4. Send it to the channel
    
    // Mock implementation - in real app, this would integrate with your messaging system
    const updatesMessage = {
      id: Date.now().toString(),
      content: message,
      type: 'system' as const,
      senderId: 'ai-system',
      senderName: 'AI Assistant',
      timestamp: new Date(),
      channelId: channelType,
      imageUri: imageUri,
    };
    
    // You would add this message to the updates channel
    // For now, we'll just show a success message
    return updatesMessage;
  };

  const renderReport = (report: PhotoReport) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportTypeContainer}>
          <Ionicons 
            name={report.type === 'progress' ? 'trending-up' : 'warning'} 
            size={20} 
            color={report.type === 'progress' ? theme.colors.success : theme.colors.error} 
          />
          <Text style={[
            styles.reportType,
            { color: report.type === 'progress' ? theme.colors.success : theme.colors.error }
          ]}>
            {report.type === 'progress' ? 'Progress Report' : 'Issue Report'}
          </Text>
        </View>
        <Text style={styles.timestamp}>
          {report.timestamp.toLocaleString()}
        </Text>
      </View>
      
      <Image source={{ uri: report.imageUri }} style={styles.reportImage} />
      
      {report.description && (
        <Text style={styles.description}>{report.description}</Text>
      )}
      
      <View style={styles.aiReportContainer}>
        <Text style={styles.aiReportTitle}>AI Analysis:</Text>
        <ScrollView style={styles.aiReportScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.aiReportText}>{report.aiReport}</Text>
        </ScrollView>
      </View>
      
      <View style={styles.tagsContainer}>
        {report.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (!permission) {
    return (
      <View style={globalStyles.center}>
        <Text style={globalStyles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={globalStyles.center}>
        <Text style={globalStyles.text}>No access to camera</Text>
        <TouchableOpacity style={globalStyles.button} onPress={requestPermission}>
          <Text style={globalStyles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Project Indicator */}
        {currentProjectId && (
          <View style={styles.projectIndicator}>
            <Ionicons name="folder" size={16} color={theme.colors.primary} />
            <Text style={styles.projectIndicatorText}>
              Reporting to current project ({currentProjectReports.length} reports)
            </Text>
          </View>
        )}
        
        {/* Report Type Selection */}
        <View style={styles.typeSelection}>
          <Text style={styles.sectionTitle}>Report Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                reportType === 'progress' && styles.selectedTypeButton
              ]}
              onPress={() => setReportType('progress')}
            >
              <Ionicons 
                name="trending-up" 
                size={24} 
                color={reportType === 'progress' ? theme.colors.text : theme.colors.success} 
              />
              <Text style={[
                styles.typeButtonText,
                reportType === 'progress' && styles.selectedTypeButtonText
              ]}>
                Progress
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                reportType === 'issue' && styles.selectedTypeButton
              ]}
              onPress={() => setReportType('issue')}
            >
              <Ionicons 
                name="warning" 
                size={24} 
                color={reportType === 'issue' ? theme.colors.text : theme.colors.error} 
              />
              <Text style={[
                styles.typeButtonText,
                reportType === 'issue' && styles.selectedTypeButtonText
              ]}>
                Issue
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Camera Section */}
        <View style={styles.cameraSection}>
          <Text style={styles.sectionTitle}>Take Photo</Text>
          {capturedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => setCapturedImage(null)}
              >
                <Ionicons name="refresh" size={20} color={theme.colors.text} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={48} color={theme.colors.primary} />
              <Text style={styles.cameraButtonText}>Open Camera</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Add any additional details about this report..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!capturedImage || isGeneratingReport || isSubmitting) && styles.disabledButton
          ]}
          onPress={submitReport}
          disabled={!capturedImage || isGeneratingReport || isSubmitting}
        >
          <Ionicons 
            name={isGeneratingReport || isSubmitting ? "hourglass" : "send"} 
            size={20} 
            color={theme.colors.text} 
          />
          <Text style={styles.submitButtonText}>
            {isGeneratingReport ? 'Generating AI Report...' : 
             isSubmitting ? 'Submitting Report...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>

        {/* Recent Reports */}
        {currentProjectReports.length > 0 && (
          <View style={styles.recentReports}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {currentProjectReports.map(renderReport)}
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            ref={(ref) => setCameraRef(ref)}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={30} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  projectIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  projectIndicatorText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  typeSelection: {
    marginBottom: theme.spacing.xl,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  selectedTypeButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  typeButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectedTypeButtonText: {
    color: theme.colors.text,
  },
  cameraSection: {
    marginBottom: theme.spacing.xl,
  },
  cameraButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  cameraButtonText: {
    marginTop: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  imagePreview: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  retakeText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 16,
  },
  descriptionSection: {
    marginBottom: theme.spacing.xl,
  },
  descriptionInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  disabledButton: {
    backgroundColor: theme.colors.textMuted,
  },
  submitButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  recentReports: {
    marginBottom: theme.spacing.xl,
  },
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportType: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  reportImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  aiReportContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  aiReportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  aiReportScroll: {
    maxHeight: 150,
  },
  aiReportText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.full,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.full,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 60,
    height: 60,
  },
});

