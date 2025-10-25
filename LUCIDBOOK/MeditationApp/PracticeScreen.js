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
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PracticeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explore'); // PracticeScreen 是 explore 頁面

  const practices = [
    {
      id: 1,
      title: '呼吸穩定力',
      description: '透過專注的呼吸練習，提升情緒穩定與了解自己',
      duration: '2~3 mins',
      image: require('./assets/breathing.jpg'),
      backgroundColor: '#E8F5E9',
      route: 'BreathingPractice',
    },
    {
      id: 2,
      title: '心理韌力練習',
      description: '強化自我覺察、平靜心情、透露壓力並更了解自己',
      duration: '7 mins',
      image: require('./assets/resilience.jpg'),
      backgroundColor: '#FFF3E0',
      route: 'EmotionPractice',
    },
    {
      id: 3,
      title: '五感覺察',
      description: '通過五感體驗，提升當下的覺察力',
      duration: '5 mins',
      backgroundColor: '#E3F2FD',
      route: 'FiveSensesPractice',
    },
    {
      id: 4,
      title: '自我覺察練習',
      description: '深入了解自己的想法和感受',
      duration: '6 mins',
      backgroundColor: '#F3E5F5',
      route: 'SelfAwarenessPractice',
    },
  ];

  const filteredPractices = practices.filter((practice) =>
    practice.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* 頂部標題區 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>早安💛覺活有光的一天</Text>
            <Text style={styles.username}>XXX player</Text>
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
            placeholder="發掘練習或是搜尋相症"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* 課程列表 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>新上架課程</Text>
          <TouchableOpacity>
            <Ionicons name="grid-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          透過有一輩生命大發覺練習，一起活成自我的每日自己
        </Text>

        {/* 練習卡片 */}
        {filteredPractices.map((practice) => (
          <TouchableOpacity
            key={practice.id}
            style={[styles.card, { backgroundColor: practice.backgroundColor }]}
            onPress={() => navigation.navigate(practice.route)}
          >
            {practice.image && (
              <Image source={practice.image} style={styles.cardImage} />
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{practice.title}</Text>
                <TouchableOpacity style={styles.bookmarkButton}>
                  <Ionicons name="bookmark-outline" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardDescription}>{practice.description}</Text>
              <Text style={styles.cardDuration}>{practice.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部導航欄 - 使用 menu.png 背景圖片 */}
      <View style={styles.bottomNavContainer}>
        <Image 
          source={require('./assets/images/menu.png')}
          style={styles.menuImage}
          resizeMode="stretch"
        />
        <View style={styles.bottomNav}>
          {/* Home 按鈕 */}
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              setActiveTab('home');
              navigation.navigate('Home');
            }}
          >
            <Image 
              source={require('./assets/images/new_home.png')}
              style={[
                styles.navIcon,
                activeTab === 'home' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Explore 按鈕 (當前頁面) */}
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              setActiveTab('explore');
              navigation.navigate('PracticeSelection');
            }}
          >
            <Image 
              source={require('./assets/images/new_explore.png')}
              style={[
                styles.navIcon,
                activeTab === 'explore' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* 中間的每日打卡按鈕 */}
          <TouchableOpacity 
            style={styles.centerNavButton}
            onPress={() => {
              // 每日打卡功能
              navigation.navigate('DailyCheckIn');
            }}
          >
            <Image 
              source={require('./assets/images/daily_clock.png')}
              style={styles.centerNavIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Record/Journal 按鈕 */}
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              setActiveTab('record');
              navigation.navigate('Daily');
            }}
          >
            <Image 
              source={require('./assets/images/record.png')}
              style={[
                styles.navIcon,
                activeTab === 'record' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Profile 按鈕 */}
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => {
              setActiveTab('profile');
              navigation.navigate('Profile');
            }}
          >
            <Image 
              source={require('./assets/images/new_profile.png')}
              style={[
                styles.navIcon,
                activeTab === 'profile' && styles.navIconActive
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    lineHeight: 18,
  },
  card: {
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookmarkButton: {
    padding: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardDuration: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100, // 增加底部間距，避免被導航欄遮擋
  },
  
  // ⭐ 底部導航欄 - 使用 menu.png 占滿寬度
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 94,
  },
  menuImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 115,
    opacity: 0.90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 34,
    height: 34,
  },
  navIconActive: {
    opacity: 0.4,
    tintColor: '#40A1DD',
  },
  centerNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  centerNavIcon: {
    width: 60,
    height: 60,
    bottom: 16,
    left: 2.5,
  },
});

export default PracticeScreen;