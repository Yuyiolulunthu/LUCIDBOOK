// ==========================================
// 檔案名稱: BottomNavigation.js
// 共用底部導航列組件 - Tab Navigator 版本
// 🎨 白色透明背景 + 藍色漸層滑動指示線
// ✨ 超順滑！配合 Tab Navigator 使用
// ==========================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==========================================
// 自訂 SVG 圖標元件
// ==========================================

const HomeIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const JournalIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 2V6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M16 2V6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Path d="M3 10H21" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </Svg>
);

const ProfileIcon = ({ color, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 21V19C4 17.9391 4.42143 16.9217 5.17157 16.1716C5.92172 15.4214 6.93913 15 8 15H16C17.0609 15 18.0783 15.4214 18.8284 16.1716C19.5786 16.9217 20 17.9391 20 19V21"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 圖標映射
const iconMap = {
  Home: HomeIcon,
  Daily: JournalIcon,
  Profile: ProfileIcon,
};

// 標籤映射
const labelMap = {
  Home: '首頁',
  Daily: '日記',
  Profile: '我的',
};

// ==========================================
// 導航按鈕元件
// ==========================================
const NavButton = ({ icon: Icon, label, isActive, onPress }) => {
  const activeColor = '#166CB5';
  const inactiveColor = '#9CA3AF';
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.navButtonContent, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Icon color={isActive ? activeColor : inactiveColor} size={24} />
        </View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ==========================================
// 滑動指示線元件
// ==========================================
const SlidingIndicator = ({ activeIndex, tabCount }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  
  const TAB_WIDTH = (SCREEN_WIDTH - 20) / tabCount;
  const INDICATOR_WIDTH = 36;
  const INDICATOR_OFFSET = (TAB_WIDTH - INDICATOR_WIDTH) / 2 + 10;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: activeIndex * TAB_WIDTH + INDICATOR_OFFSET,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <Animated.View
      style={[
        styles.slidingIndicatorContainer,
        { transform: [{ translateX }] },
      ]}
    >
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.slidingIndicator}
      />
    </Animated.View>
  );
};

// ==========================================
// 主元件 - 配合 Tab Navigator
// ==========================================
const BottomNavigation = (props) => {
  // 從 Tab Navigator 的 props 取得 state 和 navigation
  const { state, navigation } = props;
  
  // 安全檢查：確保 state 存在
  if (!state || !state.routes) {
    console.warn('BottomNavigation: state is undefined');
    return null;
  }

  const activeIndex = state.index;
  const routes = state.routes;

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.menuBackground} />

      <SlidingIndicator 
        activeIndex={activeIndex} 
        tabCount={routes.length}
      />

      <View style={styles.bottomNav}>
        {routes.map((route, index) => {
          const isFocused = activeIndex === index;
          const Icon = iconMap[route.name] || HomeIcon;
          const label = labelMap[route.name] || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <NavButton
              key={route.key}
              icon={Icon}
              label={label}
              isActive={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

// ==========================================
// 樣式
// ==========================================
const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
  },
  menuBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  slidingIndicatorContainer: {
    position: 'absolute',
    top: 2,
    left: 0,
    zIndex: 10,
  },
  slidingIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },

  bottomNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  navButtonContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  navLabelActive: {
    color: '#166CB5',
    fontWeight: '600',
  },
});

export default BottomNavigation;