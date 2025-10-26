import React from 'react';
import { View, Text } from 'react-native';
import BreathingPractice from './practice/BreathingPractice';
import EmotionPractice from './practice/EmotionPractice';
import MindfulnessPractice from './practice/MindfulnessPractice';
import SelfAwarenessPractice from './practice/SelfAwarenessPractice';

const PracticeNavigator = ({ route, navigation }) => {
  const { practiceType, onPracticeComplete } = route.params;

  switch (practiceType) {
    case '呼吸穩定力練習':
      return <BreathingPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '情緒理解力練習':
      return <EmotionPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '正念安定力練習':
      return <MindfulnessPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '自我覺察力練習':
      return <SelfAwarenessPractice navigation={navigation} onComplete={onPracticeComplete} />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>未知的練習類型</Text>
        </View>
      );
  }
};

export default PracticeNavigator;
