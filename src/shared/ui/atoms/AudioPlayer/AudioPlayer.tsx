import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { styles } from './AudioPlayer.styles';

interface AudioPlayerProps {
  audioUri: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AudioPlayer({ 
  audioUri, 
  onPlayStateChange, 
  showProgress = true,
  size = 'medium'
}: AudioPlayerProps) {
  const player = useAudioPlayer(audioUri);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime || 0);
        if (player.duration && duration === 0) {
          setDuration(player.duration);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, duration]);

  // Notify parent of play state changes
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(player.playing);
    }
  }, [player.playing, onPlayStateChange]);

  const handlePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (position: number) => {
    if (duration > 0) {
      const seekTime = (position / 100) * duration;
      player.seekTo(seekTime);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const containerStyle = [
    styles.container,
    styles[`container${size.charAt(0).toUpperCase() + size.slice(1)}`]
  ];

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[styles.playButton, styles[`playButton${size.charAt(0).toUpperCase() + size.slice(1)}`]]}
        onPress={handlePlayPause}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={player.playing ? 'Pause audio' : 'Play audio'}
      >
        <FontAwesome
          name={player.playing ? 'pause' : 'play'}
          size={iconSize}
          color="white"
        />
      </TouchableOpacity>

      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
            <TouchableOpacity
              style={[
                styles.progressThumb,
                { left: `${Math.max(0, Math.min(100, progressPercentage))}%` }
              ]}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const progressBarWidth = 200; // Approximate width
                const position = (locationX / progressBarWidth) * 100;
                handleSeek(position);
              }}
              accessibilityRole="adjustable"
              accessibilityLabel="Audio progress"
            />
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}