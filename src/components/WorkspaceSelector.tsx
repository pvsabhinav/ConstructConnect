import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface Project {
  id: string;
  name: string;
  projectId: string;
}

interface WorkspaceSelectorProps {
  workspaces: Project[];
  selectedWorkspace: Project | null;
  onSelectWorkspace: (workspace: Project) => void;
  onCreateWorkspace: (name: string, projectId: string) => void;
}

export default function WorkspaceSelector({
  workspaces,
  selectedWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
}: WorkspaceSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newProjectId, setNewProjectId] = useState('');

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName.trim() || !newProjectId.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    onCreateWorkspace(newWorkspaceName.trim(), newProjectId.trim());
    setNewWorkspaceName('');
    setNewProjectId('');
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.workspaceInfo}>
            <Text style={styles.workspaceName}>
              {selectedWorkspace?.name || 'Select Project'}
            </Text>
            <Text style={styles.projectId}>
              {selectedWorkspace?.projectId || ''}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Project</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.workspaceList} showsVerticalScrollIndicator={false}>
            {workspaces.map((workspace) => (
              <TouchableOpacity
                key={workspace.id}
                style={[
                  styles.workspaceItem,
                  selectedWorkspace?.id === workspace.id && styles.selectedWorkspaceItem
                ]}
                onPress={() => {
                  onSelectWorkspace(workspace);
                  setShowModal(false);
                }}
              >
                <View style={styles.workspaceItemContent}>
                  <View style={styles.workspaceIcon}>
                    <Ionicons name="business" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.workspaceDetails}>
                    <Text style={styles.workspaceItemName}>{workspace.name}</Text>
                    <Text style={styles.workspaceItemId}>{workspace.projectId}</Text>
                  </View>
                  {selectedWorkspace?.id === workspace.id && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.createSection}>
            <Text style={styles.createTitle}>Create New Project</Text>
            <TextInput
              style={styles.input}
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              placeholder="Project name"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TextInput
              style={styles.input}
              value={newProjectId}
              onChangeText={setNewProjectId}
              placeholder="Project ID"
              placeholderTextColor={theme.colors.textMuted}
            />
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateWorkspace}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
              <Text style={styles.createButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    ...theme.shadows.sm,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  projectId: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  workspaceList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  workspaceItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  selectedWorkspaceItem: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  workspaceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  workspaceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  workspaceDetails: {
    flex: 1,
  },
  workspaceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  workspaceItemId: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  createSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  createButtonText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});


