// ==========================================
// 檔案名稱: PracticeSelectionScreen.js
// Explore 頁面 - 包含單個練習和訓練計畫
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import BottomNavigation from './BottomNavigation';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PracticeSelectionScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'practice', 'program'

  // 單個練習
  const practices = [
    {
      id: 1,
      title: '呼吸穩定力',
      description: '透過專注的呼吸練習，提升情緒穩定與了解自己',
      duration: '2~3 mins',
      image: require('./assets/breathing.jpg'),
      backgroundColor: '#E8F5E9',
      route: 'BreathingPractice',
      type: 'single',
    },
    {
      id: 2,
      title: '心理韌力練習',
      description: '強化自我覺察、平靜心情、透露壓力並更了解自己',
      duration: '7 mins',
      image: require('./assets/resilience.jpg'),
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
      image: require('./assets/breathing.jpg'),
      type: 'plan',
      route: 'TrainingPlanDetail',
      units: ['呼吸穩定力練習', '情緒理解力練習', '正念安定力練習', '自我覺察力練習'],
    },
  ];

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

  const handleItemPress = (item) => {
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
            <Text style={styles.username}>發現適合你的成長之路</Text>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

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
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Ionicons name="bookmark-outline" size={18} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                {item.type === 'single' ? (
                  <Text style={styles.cardDuration}>{item.duration}</Text>
                ) : (
                  <View style={styles.planInfo}>
                    <Text style={styles.planCategory}>{item.category}</Text>
                    <Text style={styles.planLevel}> • {item.level}</Text>
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
  cardDuration: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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