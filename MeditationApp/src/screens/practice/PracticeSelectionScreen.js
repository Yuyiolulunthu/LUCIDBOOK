// ==========================================
// 檔案名稱: PracticeSelectionScreen.js
// 🎨 採用 LUCIDBOOK 統一設計系統
// 🔒 已整合登入檢查功能
// ⭐ 已整合收藏功能
// ⭐ 雙欄卡片設計（寬度縮減為一半）
// 🎨 統一使用 lucide-react-native 圖標
// 🎨 統一配色方案與 HomeScreen 一致
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../../navigation/BottomNavigation';
import AppHeader from '../../navigation/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';
import MaskedView from '@react-native-masked-view/masked-view';
// ⭐ 引入 lucide-react-native 圖標
import { Wind, PenLine, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PracticeSelectionScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // ⭐ 單個練習 - 使用 lucide 圖標組件，與 HomeScreen 完全一致
  const practices = [
    {
      id: 1,
      title: '呼吸練習',
      subtitle: 'Breathing',
      description: '透過專注的呼吸練習，提升情緒穩定',
      duration: '2~3m',
      icon: Wind, // ⭐ 使用 lucide Wind 組件
      gradient: ['#166CB5', '#31C6FE'], // ⭐ 與 HomeScreen 一致
      accentColor: '#166CB5',
      category: '正念',
      route: 'BreathingPractice',
      type: 'single',
    },
    {
      id: 5,
      title: '好事書寫',
      subtitle: 'Good Things',
      description: '用好事書寫改變負向對話的神經迴路',
      duration: '10m',
      icon: PenLine, // ⭐ 使用 lucide PenLine 組件
      gradient: ['#FFBC42', '#FF8C42'], // ⭐ 與 HomeScreen 一致
      accentColor: '#FF8C42',
      category: '正向',
      route: 'GoodThingsJournal',
      type: 'single',
    },
  ];

  // ⭐ 訓練計畫 - 使用 lucide 圖標
  const trainingPlans = [
    {
      id: 101,
      title: '情緒抗壓力計畫',
      subtitle: 'Training',
      description: '快速調整心態、降低內耗',
      unitCount: 2,
      category: '計畫',
      level: '初級',
      icon: Briefcase, // ⭐ 使用 lucide Briefcase 組件
      gradient: ['#8B5CF6', '#A78BFA'],
      accentColor: '#8B5CF6',
      type: 'plan',
      route: 'TrainingPlanDetail',
      units: ['呼吸練習', '好事發生練習'],
    },
  ];

  useEffect(() => {
    checkLoginStatus();
    loadFavorites();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      const loggedIn = await ApiService.isLoggedIn();
      
      if (loggedIn) {
        try {
          const response = await ApiService.getUserProfile();
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          });
          setIsLoggedIn(true);
        } catch (error) {
          console.log('Token 無效，清除並設為未登入');
          await ApiService.clearToken();
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.log('檢查登入狀態失敗:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('載入收藏失敗:', error);
    }
  };

  const toggleFavorite = async (item) => {
    if (!isLoggedIn) {
      Alert.alert(
        '需要登入',
        '請先登入才能收藏練習',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '立即登入',
            onPress: () => navigation.navigate('Profile'),
          },
        ]
      );
      return;
    }

    try {
      const itemId = `${item.type}-${item.id}`;
      const isFavorited = favorites.includes(itemId);

      let newFavorites;
      if (isFavorited) {
        newFavorites = favorites.filter(id => id !== itemId);
      } else {
        newFavorites = [...favorites, itemId];
        Alert.alert('已收藏', `「${item.title}」已加入收藏`);
      }

      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);

      if (isLoggedIn) {
        try {
          await ApiService.updateFavorites(newFavorites);
        } catch (error) {
          console.log('同步收藏到後端失敗:', error);
        }
      }
    } catch (error) {
      console.error('切換收藏狀態失敗:', error);
      Alert.alert('操作失敗', '請稍後再試');
    }
  };

  const isFavorited = (item) => {
    const itemId = `${item.type}-${item.id}`;
    return favorites.includes(itemId);
  };

  const showLoginPrompt = () => {
    Alert.alert(
      '需要登入',
      '請先登入以開始練習和訓練計畫',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '立即登入',
          onPress: () => navigation.navigate('Profile'),
        },
      ]
    );
  };

  const getFilteredItems = () => {
    let items = [];
    if (selectedTab === 'all') {
      items = [...practices, ...trainingPlans];
    } else if (selectedTab === 'practice') {
      items = practices;
    } else if (selectedTab === 'program') {
      items = trainingPlans;
    }

    if (searchQuery) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  const handleItemPress = (item) => {
    if (!isLoggedIn) {
      showLoginPrompt();
      return;
    }

    if (item.type === 'plan') {
      navigation.navigate('TrainingPlanDetail', { plan: item });
    } else {
      navigation.navigate(item.route);
    }
  };

  // ⭐ 漸層收藏圖標組件
  const GradientBookmarkIcon = ({ isFavorited }) => {
    const iconName = isFavorited ? "bookmark" : "bookmark-outline";
    
    return (
      <MaskedView
        maskElement={
          <View style={styles.iconMask}>
            <Ionicons name={iconName} size={24} color="white" />
          </View>
        }
      >
        <LinearGradient
          colors={['#166CB5', '#31C6FE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientIconContainer}
        >
          <Ionicons name={iconName} size={24} color="transparent" />
        </LinearGradient>
      </MaskedView>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader navigation={navigation} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>練習精選</Text>
              <Text style={styles.headerSubtitle}>
                {isLoggedIn && user ? `歡迎，${user.name}` : '發現適合你的成長之路'}
              </Text>
            </View>
            
            {/* ⭐ 修改後的收藏按鈕 - 只有圖標漸層 */}
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => {
                if (!isLoggedIn) {
                  Alert.alert(
                    '需要登入',
                    '請先登入以查看收藏',
                    [
                      { text: '取消', style: 'cancel' },
                      { text: '立即登入', onPress: () => navigation.navigate('Profile') },
                    ]
                  );
                } else {
                  navigation.navigate('Favorites');
                }
              }}
            >
              <GradientBookmarkIcon isFavorited={favorites.length > 0} />
            </TouchableOpacity>
          </View>

          {/* 登入狀態提示 */}
          {!isLoggedIn && !loading && (
            <TouchableOpacity
              style={styles.loginPromptBanner}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginPromptGradient}
              >
                <Ionicons name="information-circle" size={20} color="#166CB5" />
                <Text style={styles.loginPromptText}>登入以開始您的練習之旅</Text>
                <Ionicons name="chevron-forward" size={20} color="#166CB5" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* 搜尋框 */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="搜尋練習或訓練計畫"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 分類標籤 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tabButtonContainer}
              onPress={() => setSelectedTab('all')}
            >
              {selectedTab === 'all' ? (
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>全部</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>全部</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonContainer}
              onPress={() => setSelectedTab('practice')}
            >
              {selectedTab === 'practice' ? (
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>單個練習</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>單個練習</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabButtonContainer}
              onPress={() => setSelectedTab('program')}
            >
              {selectedTab === 'program' ? (
                <LinearGradient
                  colors={['#166CB5', '#31C6FE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabActive}
                >
                  <Text style={styles.tabTextActive}>訓練計畫</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={styles.tabTextInactive}>訓練計畫</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 內容列表 */}
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'all' && '所有內容'}
              {selectedTab === 'practice' && '單個練習'}
              {selectedTab === 'program' && '訓練計畫'}
            </Text>
            <Text style={styles.itemCount}>共 {filteredItems.length} 項</Text>
          </View>

          {/* ⭐ 雙欄卡片網格 */}
          <View style={styles.cardGrid}>
            {filteredItems.map((item, index) => {
              // ⭐ 獲取圖標組件
              const IconComponent = item.icon;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.practiceCard}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.9}
                >
                  {/* 🔒 未登入遮罩 */}
                  {!isLoggedIn && !loading && (
                    <View style={styles.lockOverlay}>
                      <View style={styles.lockIconContainer}>
                        <Ionicons name="lock-closed" size={20} color="#FFF" />
                      </View>
                    </View>
                  )}

                  {/* 漸層頭部 */}
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardHeader}
                  >
                    {/* 裝飾元素 */}
                    <View style={styles.decorCircle1} />
                    <View style={styles.decorCircle2} />

                    {/* 頂部：分類 + 收藏 */}
                    <View style={styles.cardHeaderTop}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                      >
                        <Ionicons 
                          name={isFavorited(item) ? "bookmark" : "bookmark-outline"} 
                          size={18} 
                          color={isFavorited(item) ? "#FFD93D" : "#FFFFFF"} 
                        />
                      </TouchableOpacity>
                    </View>

                    {/* 中間：圖標 - 使用 lucide 圖標組件 */}
                    <View style={styles.iconContainer}>
                      <View style={styles.iconCircle}>
                        <IconComponent size={32} color={item.accentColor} strokeWidth={2} />
                      </View>
                    </View>

                    {/* 底部：標題 */}
                    <View style={styles.cardHeaderBottom}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                  </LinearGradient>

                  {/* 內容區域 */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {/* 底部資訊 */}
                    <View style={styles.cardFooter}>
                      <View style={styles.durationBadge}>
                        <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                        <Text style={styles.durationText}>
                          {item.duration || `${item.unitCount}單元`}
                        </Text>
                      </View>

                      {!isLoggedIn && !loading ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={10} color="#9CA3AF" />
                        </View>
                      ) : (
                        <View style={styles.startButton}>
                          <Ionicons name="arrow-forward-circle" size={20} color={item.accentColor} />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 空狀態 */}
          {filteredItems.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>找不到相關內容</Text>
              <Text style={styles.emptySubtext}>試試其他關鍵字或分類</Text>
            </View>
          )}
        </View>

        {/* 底部提示 */}
        <View style={styles.bottomTip}>
          <LinearGradient
            colors={['rgba(255, 237, 213, 0.8)', 'rgba(255, 247, 237, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tipGradient}
          >
            <Text style={styles.tipText}>
              ✨ 建議依序完成練習，建立完整的正念基礎
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部導航欄 */}
      <BottomNavigation navigation={navigation} activeTab="explore" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollView: {
    flex: 1,
  },

  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#166CB5',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // ⭐ 修改後的收藏按鈕樣式
  favoriteButton: {
    padding: 8,
  },
  iconMask: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 登入提示
  loginPromptBanner: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  loginPromptGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  loginPromptText: {
    flex: 1,
    fontSize: 14,
    color: '#166CB5',
    fontWeight: '600',
  },

  // 搜尋框
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },

  // 分類標籤
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButtonContainer: {
    flex: 1,
  },
  tabActive: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabInactive: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabTextInactive: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 內容區域
  content: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // ⭐ 雙欄網格布局
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  
  // ⭐ 卡片寬度為螢幕的一半（扣除邊距和間隙）
  practiceCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
    marginBottom: 12,
  },

  // 鎖定遮罩
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(22, 108, 181, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  // ⭐ 卡片頭部 - 垂直布局
  cardHeader: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // 頭部頂部區域
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bookmarkButton: {
    padding: 4,
  },

  // 圖標容器
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 1,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // 頭部底部區域
  cardHeaderBottom: {
    zIndex: 1,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },

  // ⭐ 卡片內容區域
  cardContent: {
    padding: 14,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
    height: 36,
    fontWeight: '500',
  },
  
  // 底部資訊
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#166CB5',
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 空狀態
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },

  // 底部提示
  bottomTip: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tipGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 100,
  },
});

export default PracticeSelectionScreen;