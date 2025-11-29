// ==========================================
// 檔案位置: src/navigation/LockedOverlay.js
// 功能: 通用鎖定遮罩組件
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, LogIn, Key } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const LockedOverlay = ({ 
  navigation, 
  reason = 'login', // 'login' | 'enterprise-code'
  message,
  onUnlock 
}) => {
  const handleAction = () => {
    if (onUnlock) {
      onUnlock();
      return;
    }

    if (reason === 'login') {
      navigation.navigate('Login');
    } else if (reason === 'enterprise-code') {
      navigation.navigate('EnterpriseCode');
    }
  };

  const getContent = () => {
    if (reason === 'login') {
      return {
        icon: <LogIn size={64} color="#166CB5" strokeWidth={1.5} />,
        title: '需要登入',
        subtitle: message || '登入後即可使用此功能',
        buttonText: '立即登入',
        buttonColors: ['#166CB5', '#31C6FE'],
      };
    } else {
      return {
        icon: <Key size={64} color="#F59E0B" strokeWidth={1.5} />,
        title: '需要企業引薦碼',
        subtitle: message || '輸入企業引薦碼以解鎖完整功能',
        buttonText: '輸入引薦碼',
        buttonColors: ['#F59E0B', '#FBBF24'],
      };
    }
  };

  const content = getContent();

  return (
    <View style={styles.overlay}>
      {/* 模糊背景 */}
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="light" />
      
      {/* 內容卡片 */}
      <View style={styles.contentCard}>
        {/* 鎖定圖標 */}
        <View style={styles.lockIconContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
            style={styles.lockIconCircle}
          >
            <View style={styles.lockIconInner}>
              <Lock size={40} color="#6B7280" strokeWidth={2} />
            </View>
          </LinearGradient>
        </View>

        {/* 主要圖標 */}
        <View style={styles.mainIcon}>
          {content.icon}
        </View>

        {/* 文字說明 */}
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>

        {/* 操作按鈕 */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleAction}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={content.buttonColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionButtonGradient}
          >
            <Text style={styles.actionButtonText}>{content.buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: width - 64,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  lockIconContainer: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  lockIconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actionButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default LockedOverlay;