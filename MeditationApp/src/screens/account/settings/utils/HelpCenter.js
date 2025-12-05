// ==========================================
// 檔案名稱: HelpCenter.js
// 功能: 幫助中心頁面 - 含郵件功能
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIES = [
  { name: '全部', icon: 'grid-outline' },
  { name: '概念', icon: 'bulb-outline' },
  { name: '練習', icon: 'pulse-outline' },
  { name: '科學', icon: 'flask-outline' },
];

const FAQS = [
  {
    id: 1,
    category: '概念',
    question: '什麼是心理肌力訓練?',
    answer: '這不是心理諮商,而是大腦的健身房!結合 CBT 與正念,我們提供每日 7 分鐘的練習,幫助您建立心理韌性。'
  },
  {
    id: 2,
    category: '概念',
    question: '我需要具備心理學背景嗎?',
    answer: '完全不需要!我們的練習專為大眾設計,引導語簡單易懂,讓任何人都能輕鬆應用在日常生活中。'
  },
  {
    id: 3,
    category: '練習',
    question: '每天需要花多少時間?',
    answer: '我們知道您很忙碌。因此「心理肌力訓練」設計為每天僅需約 7 分鐘。持續練習比時間長短更重要。'
  },
  {
    id: 4,
    category: '練習',
    question: '如果錯過幾天怎麼辦?',
    answer: '別擔心!這很正常。只要隨時重新開始即可,沒有懲罰。對自己溫柔一點,接續練習就好。'
  },
  {
    id: 5,
    category: '科學',
    question: '為什麼重複練習很必要?',
    answer: '神經可塑性需要透過重複來建立。就像在健身房練肉需要重複舉重,建立「心理肌力」也需要持續的心智練習來形成新的、健康的神經迴路。'
  }
];

const HelpCenter = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(1); // 預設展開第一題
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  // 篩選 FAQ
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === '全部' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 切換 FAQ 展開/收合
  const toggleFaq = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ⭐ 開啟郵件應用程式
  const handleContactSupport = async () => {
    const email = 'team@lucidbook.tw';
    const subject = 'LUCIDBOOK 客服諮詢'; // 郵件主旨
    const body = '您好,我想諮詢關於 LUCIDBOOK 的問題:\n\n'; // 郵件內容模板
    
    // 構建 mailto URL
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      // 檢查是否可以開啟郵件應用程式
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        // 如果無法開啟,顯示錯誤訊息
        Alert.alert(
          '無法開啟郵件應用程式',
          `請手動發送郵件至:\n${email}`,
          [
            {
              text: '複製郵件地址',
              onPress: () => {
                // 如果有 Clipboard API 可以複製到剪貼簿
                Alert.alert('郵件地址', email);
              }
            },
            { text: '確定', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('開啟郵件應用程式失敗:', error);
      Alert.alert(
        '發生錯誤',
        `請手動發送郵件至:\n${email}`,
        [{ text: '確定' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header Section with Blue Gradient */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>幫助中心</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜尋問題..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.categoryButton,
                  isActive && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat.name)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={cat.icon} 
                  size={16} 
                  color={isActive ? '#FFF' : '#9CA3AF'} 
                  style={styles.categoryIcon}
                />
                <Text style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FAQ Accordion List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;

            return (
              <View
                key={faq.id}
                style={[
                  styles.faqCard,
                  isOpen && styles.faqCardOpen,
                ]}
              >
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(faq.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.faqQuestion,
                    isOpen && styles.faqQuestionOpen,
                  ]}>
                    {faq.question}
                  </Text>
                  <View style={[
                    styles.chevronContainer,
                    isOpen && styles.chevronContainerOpen,
                  ]}>
                    <Ionicons 
                      name="chevron-down" 
                      size={20} 
                      color={isOpen ? '#166CB5' : '#9CA3AF'}
                      style={[
                        styles.chevronIcon,
                        isOpen && styles.chevronIconRotated,
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.faqContent}>
                    <View style={styles.faqDivider} />
                    <Text style={styles.faqAnswer}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              沒有找到符合「{searchQuery}」的結果
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Contact Support Button - ⭐ 按下開啟郵件應用程式 */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleContactSupport}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#166CB5', '#31C6FE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="mail" size={20} color="#FFF" />
            <Text style={styles.floatingButtonText}>聯繫客服支援</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Header
  header: {
    paddingTop: 47,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    fontWeight: '700',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#374151',
  },

  // Categories
  categoriesContainer: {
    paddingVertical: 24,
    backgroundColor: '#F5F7FA',
  },
  categoriesScroll: {
    paddingHorizontal: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#166CB5',
    borderColor: '#166CB5',
    shadowColor: '#166CB5',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  // FAQ Card
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  faqCardOpen: {
    borderWidth: 2,
    borderColor: '#31c7fe62',
    shadowColor: '#31C6FE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    paddingRight: 16,
    lineHeight: 22,
  },
  faqQuestionOpen: {
    color: '#166CB5',
  },
  chevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronContainerOpen: {
    backgroundColor: '#E8F4F9',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  faqContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },

  // Floating Button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    pointerEvents: 'box-none',
  },
  floatingButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 8,
  },
  floatingButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default HelpCenter;