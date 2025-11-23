// ==========================================
// 檔案名稱: Favorites.js
// 功能: 練習收藏頁面
// 🎨 統一設計風格與 PracticeSelectionScreen 一致
// 🎨 使用 lucide-react-native 圖標
// 🎨 Header 使用漸層藍色設計
// ✨ 底部語錄方框
// ✅ 顯示已收藏的練習和訓練計畫
// ✅ 支援取消收藏
// ✅ 分類顯示（全部/單個練習/訓練計畫）
// ✅ 空狀態處理
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../../api';
// ⭐ 引入 lucide-react-native 圖標
import { Wind, PenLine, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const Favorites = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // ⭐ 所有可收藏的項目 - 與 PracticeSelectionScreen 完全一致
  const allItems = [
    // 單個練習
    {
      id: 1,
      title: '呼吸練習',
      subtitle: 'Breathing',
      description: '透過專注的呼吸練習，提升情緒穩定',
      duration: '2~3m',
      icon: Wind,
      gradient: ['#166CB5', '#31C6FE'],
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
      icon: PenLine,
      gradient: ['#FFBC42', '#FF8C42'],
      accentColor: '#FF8C42',
      category: '正向',
      route: 'GoodThingsJournal',
      type: 'single',
    },
    // 訓練計畫
    {
      id: 101,
      title: '情緒抗壓力計畫',
      subtitle: 'Training',
      description: '快速調整心態、降低內耗',
      unitCount: 2,
      category: '計畫',
      level: '初級',
      icon: Briefcase,
      gradient: ['#8B5CF6', '#A78BFA'],
      accentColor: '#8B5CF6',
      type: 'plan',
      route: 'TrainingPlanDetail',
      units: ['呼吸練習', '好事發生練習'],
    },
  ];

  // ⭐ 語錄列表
  const quotes = [
    '收集當下的喜悅，蓄積未來的能量',
    '每一次練習，都是對自己的溫柔以待',
    '保持覺察，讓心靈更強韌',
    '用正念擁抱每一個當下',
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    loadFavorites();
    // 隨機選擇一句語錄
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  // 載入收藏列表
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('載入收藏失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消收藏
  const removeFavorite = async (item) => {
    Alert.alert(
      '取消收藏',
      `確定要將「${item.title}」從收藏中移除嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: async () => {
            try {
              const itemId = `${item.type}-${item.id}`;
              const newFavorites = favorites.filter(id => id !== itemId);
              await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
              setFavorites(newFavorites);

              // 同步到後端
              try {
                await ApiService.updateFavorites(newFavorites);
              } catch (error) {
                console.log('同步到後端失敗:', error);
              }
            } catch (error) {
              console.error('取消收藏失敗:', error);
              Alert.alert('操作失敗', '請稍後再試');
            }
          }
        }
      ]
    );
  };

  // 獲取收藏的項目
  const getFavoriteItems = () => {
    const favoriteItems = allItems.filter(item => {
      const itemId = `${item.type}-${item.id}`;
      return favorites.includes(itemId);
    });

    // 根據標籤過濾
    if (selectedTab === 'practice') {
      return favoriteItems.filter(item => item.type === 'single');
    } else if (selectedTab === 'plan') {
      return favoriteItems.filter(item => item.type === 'plan');
    }
    return favoriteItems;
  };

  const favoriteItems = getFavoriteItems();

  // 處理項目點擊
  const handleItemPress = (item) => {
    if (item.type === 'plan') {
      navigation.navigate('TrainingPlanDetail', { plan: item });
    } else {
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* ⭐ Header - 漸層藍色設計 */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

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
              <Text style={styles.tabTextActive}>全部 ({favoriteItems.length})</Text>
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
          onPress={() => setSelectedTab('plan')}
        >
          {selectedTab === 'plan' ? (
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

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {favoriteItems.length > 0 ? (
          <>
            <View style={styles.cardGrid}>
              {favoriteItems.map((item) => {
                const IconComponent = item.icon;
                
                return (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    style={styles.practiceCard}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.9}
                  >
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

                      {/* 頂部：分類 + 收藏按鈕 */}
                      <View style={styles.cardHeaderTop}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.bookmarkButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            removeFavorite(item);
                          }}
                        >
                          <Ionicons 
                            name="bookmark" 
                            size={18} 
                            color="#FFD93D" 
                          />
                        </TouchableOpacity>
                      </View>

                      {/* 中間：圖標 */}
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

                        <View style={styles.startButton}>
                          <Ionicons name="arrow-forward-circle" size={20} color={item.accentColor} />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ⭐ 底部語錄方框 */}
            <View style={styles.quoteContainer}>
              <View style={styles.quoteCard}>
                <View style={styles.quoteIconCircle}>
                  <Ionicons name="bulb" size={20} color="#FF8C42" />
                </View>
                <Text style={styles.quoteText}>{quotes[currentQuoteIndex]}</Text>
              </View>
            </View>
          </>
        ) : (
          // 空狀態
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyIconGradient}
              >
                <Ionicons name="bookmark-outline" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.emptyTitle}>還沒有收藏</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'all' && '開始收藏你喜歡的練習和訓練計畫吧'}
              {selectedTab === 'practice' && '還沒有收藏任何單個練習'}
              {selectedTab === 'plan' && '還沒有收藏任何訓練計畫'}
            </Text>
            <TouchableOpacity 
              style={styles.exploreButtonContainer}
              onPress={() => navigation.navigate('PracticeSelection')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.exploreButton}
              >
                <Ionicons name="compass" size={20} color="#FFFFFF" />
                <Text style={styles.exploreButtonText}>探索練習</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // ⭐ Header - 漸層藍色設計
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },

  // 分類標籤
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // ⭐ 雙欄網格布局
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // ⭐ 卡片樣式 - 與 PracticeSelectionScreen 一致
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
    marginBottom: 12,
  },

  // 卡片頭部
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

  // 卡片內容區域
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
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ⭐ 底部語錄方框
  quoteContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    /* shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,*/
  },
  quoteIconCircle: {
    width: 40,
    height: 35,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
    fontWeight: '450',
  },

  // 空狀態
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontWeight: '500',
  },
  exploreButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  bottomPadding: {
    height: 80,
  },
});

export default Favorites;