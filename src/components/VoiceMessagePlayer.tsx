import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

interface VoiceMessagePlayerProps {
  uri: string;
  senderName?: string;
  timestamp?: Date;
}

export default function VoiceMessagePlayer({ uri, senderName, timestamp }: VoiceMessagePlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      Alert.alert('Error', 'Failed to load voice message');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const playPause = async () => {
    if (!sound) {
      await loadSound();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to play voice message');
    }
  };

  const stop = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        setIsPlaying(false);
        setPosition(0);
      } catch (error) {
        Alert.alert('Error', 'Failed to stop voice message');
      }
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      {senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      
      <View style={styles.playerContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={playPause}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.timeText}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={stop}
        >
          <Ionicons
            name="stop"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {timestamp && (
        <Text style={styles.timestamp}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  senderName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  progressContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
});



