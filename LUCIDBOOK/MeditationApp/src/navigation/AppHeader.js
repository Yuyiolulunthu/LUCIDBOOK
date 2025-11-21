// ==========================================
// 檔案位置: src/navigation/AppHeader.js
// 完整修正版 - 使用 expo-linear-gradient
// ==========================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Bell, X } from 'lucide-react-native';

const AppHeader = ({ navigation, showNotificationBadge = true }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: '恭喜解鎖成就',
      message: '你已經連續 3天 完成練習！心理肌力正在變強。',
      time: '剛剛',
      unread: true,
      type: 'achievement',
    },
    {
      id: '2',
      title: '練習提醒',
      message: '該進行今天的呼吸練習了，花 3 分鐘找回平靜吧。',
      time: '4小時前',
      unread: true,
      type: 'reminder',
    },
    {
      id: '3',
      title: '新功能上線',
      message: '現在可以查看詳細的練習統計了，快去看看吧！',
      time: '1天前',
      unread: false,
      type: 'update',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'achievement':
        return {
          iconBg: '#FFF5E6',
          emoji: '🎉',
        };
      case 'reminder':
        return {
          iconBg: '#FFE8EC',
          emoji: '⏰',
        };
      case 'update':
        return {
          iconBg: '#F3E8FF',
          emoji: '✨',
        };
      default:
        return {
          iconBg: '#E8F4F8',
          emoji: '📢',
        };
    }
  };

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
          {/* 左側 - 設定按鈕 */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Settings color="#FFFFFF" size={24} strokeWidth={2} />
          </TouchableOpacity>

          {/* 中間 - Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/lucidlogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>LUCIDBOOK</Text>
          </View>

          {/* 右側 - 通知按鈕 */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Bell color="#FFFFFF" size={24} strokeWidth={2} />
            {showNotificationBadge && unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 通知面板 Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNotifications(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotifications(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.notificationPanel}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.notificationHeader}>
              <View style={styles.notificationTitleRow}>
                <Text style={styles.notificationTitle}>通知中心</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X color="#9CA3AF" size={28} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <Text style={styles.recentLabel}>RECENT</Text>
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.markAllButton}>全部標記為已讀</Text>
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.notificationList}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length > 0 ? (
                notifications.map((notification, index) => {
                  const style = getNotificationStyle(notification.type);
                  const isLast = index === notifications.length - 1;
                  
                  return (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        notification.unread && styles.notificationItemUnread,
                        isLast && styles.notificationItemLast,
                      ]}
                      onPress={() => markAsRead(notification.id)}
                    >
                      {notification.unread && (
                        <View style={styles.unreadIndicator} />
                      )}

                      <View style={styles.notificationContent}>
                        <View
                          style={[
                            styles.notificationIconCircle,
                            {
                              backgroundColor: notification.unread
                                ? style.iconBg
                                : '#F3F4F6',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.notificationEmoji,
                              !notification.unread &&
                                styles.notificationEmojiRead,
                            ]}
                          >
                            {style.emoji}
                          </Text>
                        </View>

                        <View style={styles.notificationTextBlock}>
                          <View style={styles.notificationTopRow}>
                            <Text
                              style={[
                                styles.notificationItemTitle,
                                !notification.unread &&
                                  styles.notificationItemTitleRead,
                              ]}
                            >
                              {notification.title}
                            </Text>
                            <Text
                              style={[
                                styles.notificationTime,
                                notification.unread &&
                                  styles.notificationTimeUnread,
                              ]}
                            >
                              {notification.time}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.notificationMessage,
                              !notification.unread &&
                                styles.notificationMessageRead,
                            ]}
                          >
                            {notification.message}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyNotification}>
                  <Bell color="#D1D5DB" size={48} strokeWidth={1.5} />
                  <Text style={styles.emptyNotificationText}>暫無通知</Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50, // ⭐ 調整為 50
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
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '500', // ⭐ 從 '600' 調整為 '500' (更細)
    color: '#FFFFFF',
    letterSpacing: 2, // ⭐ 從 1.5 調整為 2 (更寬)
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal 樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  notificationPanel: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden', // ⭐ 確保圓角正確顯示
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  unreadBadge: {
    backgroundColor: '#31C6FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  recentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#31C6FE',
  },
  notificationList: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16, // ⭐ 增加底部內距確保圓角
  },
  notificationItem: {
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationItemUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  notificationItemLast: {
    marginBottom: 4, // ⭐ 最後一個項目減少間距
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 16,
    bottom: 16,
    width: 4,
    backgroundColor: '#31C6FE',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
    gap: 12,
  },
  notificationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationEmojiRead: {
    opacity: 0.4,
  },
  notificationTextBlock: {
    flex: 1,
  },
  notificationTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  notificationItemTitleRead: {
    color: '#6B7280',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  notificationTimeUnread: {
    color: '#31C6FE',
    fontWeight: '600',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  notificationMessageRead: {
    color: '#9CA3AF',
  },
  emptyNotification: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyNotificationText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default AppHeader;