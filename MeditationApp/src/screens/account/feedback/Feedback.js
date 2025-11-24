// ==========================================
// 檔案名稱: Feedback.js
// 功能: 意見回饋（報修）頁面
// 
// ✅ 問題類型選擇 (2x2 網格卡片)
// ✅ 詳細描述輸入
// ✅ 圖片上傳（可選）
// ✅ 聯繫方式
// ✅ 提交功能
// ✅ 成功動畫畫面
// 🎨 依照設計程式風格更新
// 🔧 修復送出問題
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
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../../../../api';

// 🔧 開發模式開關
const DEV_MODE = true; // 設為 false 就會使用真實 API

const ISSUE_TYPES = [
  { 
    id: 'feature', 
    label: '功能建議', 
    icon: 'bulb-outline', 
    gradientColors: ['#FBBF24', '#F97316'],
  },
  { 
    id: 'bug', 
    label: '問題回報', 
    icon: 'bug-outline', 
    gradientColors: ['#EF4444', '#F43F5E'],
  },
  { 
    id: 'praise', 
    label: '給予鼓勵', 
    icon: 'heart-outline', 
    gradientColors: ['#EC4899', '#F43F5E'],
  },
  { 
    id: 'other', 
    label: '其他意見', 
    icon: 'chatbubble-ellipses-outline', 
    gradientColors: ['#3B82F6', '#06B6D4'],
  },
];

const Feedback = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePickImage = async () => {
    if (images.length >= 3) {
      Alert.alert('提示', '最多只能上傳3張圖片');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要權限', '請允許訪問相簿以上傳圖片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages([...images, result.assets[0]]);
      }
    } catch (error) {
      console.error('選擇圖片失敗:', error);
      Alert.alert('錯誤', '選擇圖片失敗');
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    // 驗證
    if (!selectedType) {
      Alert.alert('提示', '請選擇問題類型');
      return;
    }

    if (!description.trim()) {
      Alert.alert('提示', '請描述您的問題或建議');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('提示', '請至少輸入10個字的描述');
      return;
    }

    setLoading(true);

    try {
      // 準備提交數據
      const feedbackData = {
        type: selectedType,
        description: description.trim(),
        contactInfo: contactInfo.trim(),
        images: images.map(img => img.uri),
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      };

      // 記錄到控制台（開發時查看）
      console.log('📝 回饋資料:', JSON.stringify(feedbackData, null, 2));

      let response;

      if (DEV_MODE) {
        // === 開發階段：模擬成功 ===
        console.log('⚠️ 開發模式：使用模擬回應');
        await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬網路延遲
        response = { success: true, message: '回饋已收到' };
      } else {
        // === 正式環境：呼叫真實 API ===
        console.log('🌐 正式模式：呼叫後端 API');
        
        // 檢查 ApiService 是否有 submitFeedback 方法
        if (typeof ApiService.submitFeedback !== 'function') {
          throw new Error('ApiService.submitFeedback 方法不存在，請先實作此方法');
        }
        
        response = await ApiService.submitFeedback(feedbackData);
      }

      console.log('✅ API 回應:', response);

      if (response.success) {
        setIsSubmitted(true);
        // 2秒後返回
        setTimeout(() => {
          // 清空表單
          setSelectedType(null);
          setDescription('');
          setContactInfo('');
          setImages([]);
          setIsSubmitted(false);
          navigation.goBack();
        }, 2000);
      } else {
        Alert.alert('提交失敗', response.message || '請稍後再試');
      }
    } catch (error) {
      console.error('❌ 提交失敗:', error);
      
      // 更詳細的錯誤訊息
      let errorMessage = '提交失敗，請檢查網路連線後重試';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.response) {
        errorMessage = `伺服器錯誤: ${error.response.status}`;
      }
      
      Alert.alert('錯誤', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedType && description.trim().length >= 10;

  // 成功畫面
  if (isSubmitted) {
    return (
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.successContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#FFF" />
          </View>
          <Text style={styles.successTitle}>感謝您的回饋！</Text>
          <Text style={styles.successText}>我們會仔細閱讀並持續改進</Text>
          {DEV_MODE && (
            <Text style={styles.devModeText}>
              (開發模式 - 未真實送出)
            </Text>
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#166CB5" />
      
      {/* Header */}
      <LinearGradient
        colors={['#166CB5', '#31C6FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>意見與問題回報</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <Text style={styles.headerSubtitle}>
          您的每一份回饋都能幫助我們變得更好
        </Text>
        {DEV_MODE && (
          <View style={styles.devModeBadge}>
            <Text style={styles.devModeBadgeText}>🔧 開發模式</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 問題類型選擇 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>選擇回饋類型</Text>
          
          <View style={styles.typeGrid}>
            {ISSUE_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    isSelected && styles.typeCardSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={type.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.typeIconContainer}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={24} 
                      color="#FFF" 
                    />
                  </LinearGradient>
                  <Text style={[
                    styles.typeLabel,
                    isSelected && styles.typeLabelSelected,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 詳細描述 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>詳細說明</Text>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="請詳細描述您的建議或遇到的問題..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          <Text style={styles.charCount}>
            {description.length} / 500 字
          </Text>
        </View>

        {/* 聯繫方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            聯絡信箱 <Text style={styles.optional}>(選填)</Text>
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="如需回覆，請留下您的信箱"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* 圖片上傳 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            上傳截圖 <Text style={styles.optional}>(選填，最多3張)</Text>
          </Text>
          
          {/* 上傳按鈕 */}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.uploadIconContainer}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#FFF" />
            </LinearGradient>
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>點擊上傳截圖</Text>
              <Text style={styles.uploadHint}>支援 JPG、PNG 格式</Text>
            </View>
          </TouchableOpacity>

          {/* 已上傳圖片預覽 */}
          {images.length > 0 && (
            <View style={styles.imageContainer}>
              {images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <View style={styles.removeImageIcon}>
                      <Ionicons name="close" size={14} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 提示卡片 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 <Text style={styles.infoTextBold}>小提示：</Text>我們重視每一份回饋，通常會在 3-5 個工作天內處理。若需要即時協助，請透過客服信箱聯繫我們。
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* 底部提交按鈕 */}
      <View style={styles.submitContainer}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            !isFormValid && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
          activeOpacity={0.8}
        >
          {isFormValid ? (
            <LinearGradient
              colors={['#166CB5', '#31C6FE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.submitButtonText}>送出中...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>送出回饋</Text>
                </>
              )}
            </LinearGradient>
          ) : (
            <View style={styles.submitButtonDisabledInner}>
              <Ionicons name="send" size={20} color="#9CA3AF" />
              <Text style={styles.submitButtonTextDisabled}>送出回饋</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  // Success Screen
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  devModeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 12,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 8,
  },
  devModeBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  devModeBadgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  optional: {
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Type Selection - 2x2 Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  typeCardSelected: {
    borderColor: '#166CB5',
    backgroundColor: 'rgba(22,108,181,0.08)',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  typeLabelSelected: {
    color: '#166CB5',
  },

  // Text Area
  textAreaContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  textArea: {
    fontSize: 15,
    color: '#111827',
    minHeight: 140,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },

  // Input
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    fontSize: 15,
    color: '#111827',
  },

  // Upload Button
  uploadButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTextContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Image Preview
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  imageWrapper: {
    position: 'relative',
    width: '31%',
    aspectRatio: 1,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  removeImageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  infoTextBold: {
    fontWeight: '600',
  },

  // Submit Button
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonDisabledInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  submitButtonTextDisabled: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  bottomPadding: {
    height: 20,
  },
});

export default Feedback;