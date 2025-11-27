import React from 'react';
import { View, Text } from 'react-native';
import BreathingExerciseCard from '../data/practices/BreathingExerciseCard';
import EmotionPractice from '../data/practices/EmotionPractice';
import MindfulnessPractice from '../data/practices/MindfulnessPractice';
import SelfAwarenessPractice from '../data/practices/SelfAwarenessPractice';
import GoodThingsJournal from '../data/practices/Goodthingsjournal';

const PracticeNavigator = ({ route, navigation }) => {
  const { practiceType, onPracticeComplete } = route.params;

  switch (practiceType) {
    case '呼吸穩定力練習':
      return <BreathingExerciseCard navigation={navigation} onBack={() => navigation.goBack()} />;
    case '情緒理解力練習':
      return <EmotionPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '正念安定力練習':
      return <MindfulnessPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '自我覺察力練習':
      return <SelfAwarenessPractice navigation={navigation} onComplete={onPracticeComplete} />;
    case '好事書寫':
    case '好事書寫練習':
      return <GoodThingsJournal navigation={navigation} onComplete={onPracticeComplete} />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>未知的練習類型</Text>
        </View>
      );
  }
};

export default PracticeNavigator;
