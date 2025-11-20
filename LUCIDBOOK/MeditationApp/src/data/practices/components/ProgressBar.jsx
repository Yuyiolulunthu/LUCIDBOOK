import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProgressBar({ currentStep, totalSteps, style }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={[styles.container, style]}>
      {/* Progress Track */}
      <View style={styles.progressTrack}>
        {/* Progress Fill */}
        <View style={[styles.progressFillContainer, { width: `${progress}%` }]}>
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressGradient}
          />
        </View>
      </View>

      {/* Step Counter */}
      <View style={styles.stepCounter}>
        <Text style={styles.stepText}>
          {currentStep} / {totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
  },
  progressTrack: {
    position: 'relative',
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  progressFillContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    width: '100%',
    height: '100%',
  },
  stepCounter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  stepText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
});