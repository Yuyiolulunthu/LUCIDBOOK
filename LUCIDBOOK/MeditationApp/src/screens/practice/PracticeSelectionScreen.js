// ==========================================
// 檔案名稱: PracticeSelectionScreen.js
// Explore 頁面 - 包含單個練習和訓練計畫
// 🔒 已整合登入檢查功能
// ⭐ 已整合收藏功能
// ✅ 修復 Navigation 警告
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import BottomNavigation from '../../navigation/BottomNavigation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../../api';

const { width } = Dimensions.get('window');

const PracticeSelectionScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'practice', 'program'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); // ⭐ 收藏列表

  // 單個練習
  const practices = [
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
    {
      id: 5,
      title: '好事書寫',
      description: '記住做不好的事情是大腦的原廠設定，用好事書寫改變負向對話的神經迴路',
      duration: '10 mins',
      image: require('../../../assets/images/好事發生.png'),
      backgroundColor: '#FFF5F3',
      route: 'GoodThingsJournal',
      type: 'single',
    },
  ];

  // 訓練計畫
  const trainingPlans = [
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

  // 🔒 檢查登入狀態
  useEffect(() => {
    checkLoginStatus();
    loadFavorites(); // ⭐ 載入收藏
  }, []);

  // 🔒 監聽頁面焦點，每次進入時檢查登入狀態
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginStatus();
      loadFavorites(); // ⭐ 重新載入收藏
    });
    return unsubscribe;
  }, [navigation]);

  // 🔒 檢查登入狀態函數
  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      const loggedIn = await ApiService.isLoggedIn();
      
      if (loggedIn) {
        try {
          // 嘗試獲取用戶資料以驗證 token 是否有效
          const response = await ApiService.getUserProfile();
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
          });
          setIsLoggedIn(true);
        } catch (error) {
          // Token 無效或已過期，清除 token
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

  // ⭐ 載入收藏列表
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

  // ⭐ 切換收藏狀態
  const toggleFavorite = async (item) => {
    // 檢查是否已登入
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
        // 取消收藏
        newFavorites = favorites.filter(id => id !== itemId);
        // 可選：顯示提示
        // Alert.alert('已取消收藏', `「${item.title}」已從收藏中移除`);
      } else {
        // 添加收藏
        newFavorites = [...favorites, itemId];
        Alert.alert('已收藏', `「${item.title}」已加入收藏`);
      }

      // 儲存到本地
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);

      // ⭐ 可選：同步到後端
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

  // ⭐ 檢查是否已收藏
  const isFavorited = (item) => {
    const itemId = `${item.type}-${item.id}`;
    return favorites.includes(itemId);
  };

  // 🔒 顯示登入提示
  const showLoginPrompt = () => {
    Alert.alert(
      '需要登入',
      '請先登入以開始練習和訓練計畫',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '立即登入',
          onPress: () => {
            // ✅ 不傳遞函數參數，而是依賴頁面焦點事件自動刷新
            navigation.navigate('Profile');
          },
        },
      ]
    );
  };

  // 根據標籤篩選
  const getFilteredItems = () => {
    let items = [];
    if (selectedTab === 'all') {
      items = [...practices, ...trainingPlans];
    } else if (selectedTab === 'practice') {
      items = practices;
    } else if (selectedTab === 'program') {
      items = trainingPlans;
    }

    // 搜尋過濾
    if (searchQuery) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  // 🔒 處理項目點擊（含登入檢查）
  const handleItemPress = (item) => {
    // 檢查是否已登入
    if (!isLoggedIn) {
      showLoginPrompt();
      return;
    }

    // 已登入，允許導航
    if (item.type === 'plan') {
      // 訓練計畫 - 跳轉到詳細頁面
      navigation.navigate('TrainingPlanDetail', { plan: item });
    } else {
      // 單個練習 - 直接進入練習
      navigation.navigate(item.route);
    }
  };

  return (
    <View style={styles.container}>
      {/* 頂部標題區 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>探索練習與訓練</Text>
            <Text style={styles.username}>
              {isLoggedIn && user ? `歡迎，${user.name}` : '發現適合你的成長之路'}
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </TouchableOpacity>
            {/* ⭐ 收藏按鈕 */}
            <TouchableOpacity 
              style={styles.iconButton}
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
              <Ionicons name="bookmark" size={24} color="#666" />
              {favorites.length > 0 && (
                <View style={styles.favoriteBadge}>
                  <Text style={styles.favoriteBadgeText}>{favorites.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 登入狀態提示 */}
        {!isLoggedIn && !loading && (
          <TouchableOpacity
            style={styles.loginPromptBanner}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
            <Text style={styles.loginPromptText}>登入以開始您的練習之旅</Text>
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </TouchableOpacity>
        )}

        {/* 搜尋框 */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋練習或訓練計畫"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* 分類標籤 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              全部
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
            style={[styles.tab, selectedTab === 'program' && styles.tabActive]}
            onPress={() => setSelectedTab('program')}
          >
            <Text style={[styles.tabText, selectedTab === 'program' && styles.tabTextActive]}>
              訓練計畫
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 內容列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'all' && '所有內容'}
            {selectedTab === 'practice' && '單個練習'}
            {selectedTab === 'program' && '訓練計畫'}
          </Text>
          <Text style={styles.itemCount}>共 {filteredItems.length} 項</Text>
        </View>

        {/* 練習和訓練計畫卡片 */}
        <View style={styles.gridContainer}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: item.backgroundColor }]}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.8}
            >
              {/* 🔒 未登入遮罩 */}
              {!isLoggedIn && !loading && (
                <View style={styles.lockOverlay}>
                  <View style={styles.lockIconContainer}>
                    <Ionicons name="lock-closed" size={24} color="#FFF" />
                  </View>
                </View>
              )}

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
                  {/* ⭐ 收藏按鈕 - 改進版 */}
                  <TouchableOpacity 
                    style={styles.bookmarkButton}
                    onPress={(e) => {
                      e.stopPropagation(); // 防止觸發卡片點擊
                      toggleFavorite(item);
                    }}
                  >
                    <Ionicons 
                      name={isFavorited(item) ? "bookmark" : "bookmark-outline"} 
                      size={20} 
                      color={isFavorited(item) ? "#F59E0B" : "#4A90E2"} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.type === 'single' ? (
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDuration}>{item.duration}</Text>
                    {!isLoggedIn && !loading && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={10} color="#999" />
                        <Text style={styles.lockBadgeText}>需登入</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.planInfo}>
                    <Text style={styles.planCategory}>{item.category}</Text>
                    <Text style={styles.planLevel}> • {item.level}</Text>
                    {!isLoggedIn && !loading && (
                      <View style={styles.lockBadge}>
                        <Ionicons name="lock-closed" size={10} color="#999" />
                        <Text style={styles.lockBadgeText}>需登入</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 空狀態 */}
        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>找不到相關內容</Text>
            <Text style={styles.emptySubtext}>試試其他關鍵字或分類</Text>
          </View>
        )}

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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 12,
    color: '#999',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  // ⭐ 收藏數量徽章
  favoriteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  favoriteBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // 🔒 登入提示橫幅
  loginPromptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginPromptText: {
    flex: 1,
    fontSize: 13,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  tabActive: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    fontSize: 13,
    color: '#999',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  card: {
    width: (width - 52) / 2,
    borderRadius: 15,
    marginHorizontal: 6,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  // 🔒 鎖定遮罩
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
  bookmarkButton: {
    padding: 2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
    height: 36,
  },
  // 🔒 卡片底部區域
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
  // 🔒 鎖定徽章
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  lockBadgeText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 3,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#CCC',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 120,
  },
});

export default PracticeSelectionScreen;