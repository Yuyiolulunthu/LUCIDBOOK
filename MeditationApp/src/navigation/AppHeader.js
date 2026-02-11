// ==========================================
// 檔案位置: src/navigation/AppHeader.js
// 簡化版 - 只保留 Logo
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AppHeader = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header - 藍色漸層背景 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* 中間 - Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/lucidlogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>LUCIDBOOK</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // ⭐ 改為置中對齊
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 39,
    height: 28,
  },
  logoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});

export default AppHeader;