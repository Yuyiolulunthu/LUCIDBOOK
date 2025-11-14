// ==========================================
// 檔案名稱: Favorites.js
// 功能: 練習收藏頁面
// 
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
  StatusBar,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

const { width } = Dimensions.get('window');

const Favorites = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'practice', 'plan'
  const [loading, setLoading] = useState(true);

  // 所有可收藏的項目（與 PracticeSelectionScreen 保持一致）
  const allItems = [
    // 單個練習
    {
      id: 1,
      title: '呼吸穩定力',
      description: '透過專注的呼吸練習，提升情緒穩定與了解自己',
      duration: '2~3 mins',
      image: require('../../../assets/images/breathing.jpg'),
      backgroundColor: '#E8F5E9',
      route: 'BreathingPractice',
      type: 'single',
    },
    {
      id: 2,
      title: '心理韌力練習',
      description: '強化自我覺察、平靜心情、透露壓力並更了解自己',
      duration: '7 mins',
      image: require('../../../assets/images/resilience.jpg'),
      backgroundColor: '#FFF3E0',
      route: 'EmotionPractice',
      type: 'single',
    },
    {
      id: 3,
      title: '五感覺察',
      description: '通過五感體驗，提升當下的覺察力',
      duration: '5 mins',
      backgroundColor: '#E3F2FD',
      route: 'FiveSensesPractice',
      type: 'single',
    },
    {
      id: 4,
      title: '自我覺察練習',
      description: '深入了解自己的想法和感受',
      duration: '6 mins',
      backgroundColor: '#F3E5F5',
      route: 'SelfAwarenessPractice',
      type: 'single',
    },
    // 訓練計畫
    {
      id: 101,
      title: '員工抗內耗訓練計畫',
      description: '幫助你在工作高壓下，快速調整心態、降低內耗',
      unitCount: 4,
      category: '職場心理',
      level: '初級',
      backgroundColor: '#E3F2FD',
      image: require('../../../assets/images/breathing.jpg'),
      type: 'plan',
      route: 'TrainingPlanDetail',
      units: ['呼吸穩定力練習', '情緒理解力練習', '正念安定力練習', '自我覺察力練習'],
    },
  ];

  useEffect(() => {
    loadFavorites();
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
      
      {/* Header */}
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
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>我的收藏</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* 分類標籤 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            全部 ({getFavoriteItems().length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'practice' && styles.tabActive]}
          onPress={() => setSelectedTab('practice')}
        >
          <Text style={[styles.tabText, selectedTab === 'practice' && styles.tabTextActive]}>
            單個練習
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'plan' && styles.tabActive]}
          onPress={() => setSelectedTab('plan')}
        >
          <Text style={[styles.tabText, selectedTab === 'plan' && styles.tabTextActive]}>
            訓練計畫
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {favoriteItems.length > 0 ? (
          <View style={styles.gridContainer}>
            {favoriteItems.map((item) => (
              <View key={`${item.type}-${item.id}`} style={styles.cardWrapper}>
                <TouchableOpacity
                  style={[styles.card, { backgroundColor: item.backgroundColor }]}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.8}
                >
                  {/* 類型徽章 */}
                  {item.type === 'plan' && (
                    <View style={styles.planBadgeContainer}>
                      <View style={styles.planBadge}>
                        <Ionicons name="layers-outline" size={14} color="#4A90E2" />
                        <Text style={styles.planBadgeText}>{item.unitCount}單元</Text>
                      </View>
                    </View>
                  )}

                  {/* 卡片內容 */}
                  {item.image && (
                    <Image source={item.image} style={styles.cardImage} />
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {/* 移除收藏按鈕 */}
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFavorite(item);
                        }}
                      >
                        <Ionicons name="bookmark" size={20} color="#F59E0B" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    {item.type === 'single' ? (
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardDuration}>{item.duration}</Text>
                      </View>
                    ) : (
                      <View style={styles.planInfo}>
                        <Text style={styles.planCategory}>{item.category}</Text>
                        <Text style={styles.planLevel}> • {item.level}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          // 空狀態
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bookmark-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>還沒有收藏</Text>
            <Text style={styles.emptyText}>
              {selectedTab === 'all' && '開始收藏你喜歡的練習和訓練計畫吧'}
              {selectedTab === 'practice' && '還沒有收藏任何單個練習'}
              {selectedTab === 'plan' && '還沒有收藏任何訓練計畫'}
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <LinearGradient
                colors={['#166CB5', '#31C6FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreButtonGradient}
              >
                <Ionicons name="compass" size={20} color="#FFF" />
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
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: '#166CB5',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFF',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingTop: 20,
  },
  cardWrapper: {
    width: '50%',
    padding: 6,
  },
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planBadgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planBadgeText: {
    fontSize: 11,
    color: '#4A90E2',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  removeButton: {
    padding: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
    height: 36,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDuration: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  planCategory: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
  },
  planLevel: {
    fontSize: 11,
    color: '#999',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomPadding: {
    height: 40,
  },
});

export default Favorites;