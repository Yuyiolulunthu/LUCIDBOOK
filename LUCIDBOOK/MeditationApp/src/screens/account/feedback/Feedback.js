// ==========================================
// 檔案名稱: Feedback.js
// 功能: 意見回饋（報修）頁面
// 
// ✅ 問題類型選擇
// ✅ 詳細描述輸入
// ✅ 圖片上傳（可選）
// ✅ 聯繫方式
// ✅ 提交功能
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../../../../api';

const ISSUE_TYPES = [
  { 
    id: 'bug', 
    label: '系統錯誤', 
    icon: 'bug-outline', 
    color: '#EF4444',
    bgColor: '#FEE2E2'
  },
  { 
    id: 'feature', 
    label: '功能建議', 
    icon: 'bulb-outline', 
    color: '#F59E0B',
    bgColor: '#FEF3C7'
  },
  { 
    id: 'content', 
    label: '內容問題', 
    icon: 'document-text-outline', 
    color: '#166CB5',
    bgColor: '#EFF6FF'
  },
  { 
    id: 'other', 
    label: '其他意見', 
    icon: 'chatbubble-ellipses-outline', 
    color: '#10B981',
    bgColor: '#D1FAE5'
  },
];

const Feedback = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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
      };

      // 提交到後端
      const response = await ApiService.submitFeedback(feedbackData);

      if (response.success) {
        Alert.alert(
          '感謝您的回饋！',
          '我們已收到您的意見，將盡快處理並回覆您',
          [
            {
              text: '確定',
              onPress: () => {
                // 清空表單
                setSelectedType(null);
                setDescription('');
                setContactInfo('');
                setImages([]);
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('提交失敗', response.message || '請稍後再試');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      Alert.alert('錯誤', '提交失敗，請檢查網路連線後重試');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedType && description.trim().length >= 10;

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
        <Text style={styles.headerTitle}>意見回饋</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 說明卡片 */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="heart" size={32} color="#EF4444" />
          </View>
          <Text style={styles.infoTitle}>您的意見很重要</Text>
          <Text style={styles.infoText}>
            無論是發現問題、有好的建議，或是想給我們鼓勵，都歡迎告訴我們！我們會認真對待每一條意見。
          </Text>
        </View>

        {/* 問題類型選擇 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            問題類型 <Text style={styles.required}>*</Text>
          </Text>
          
          <View style={styles.typeGrid}>
            {ISSUE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.typeIconContainer,
                  { backgroundColor: type.bgColor }
                ]}>
                  <Ionicons 
                    name={type.icon} 
                    size={28} 
                    color={type.color} 
                  />
                </View>
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.id && styles.typeLabelSelected,
                ]}>
                  {type.label}
                </Text>
                {selectedType === type.id && (
                  <View style={styles.typeCheckmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#166CB5" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 詳細描述 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            詳細描述 <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionHint}>
            請詳細描述您遇到的問題或想法（至少10個字）
          </Text>
          
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="例如：在練習頁面點擊開始按鈕後，APP閃退了..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>
              {description.length}/500
            </Text>
          </View>
        </View>

        {/* 圖片上傳 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>上傳圖片（選填）</Text>
          <Text style={styles.sectionHint}>
            可以上傳截圖幫助我們更好地理解問題（最多3張）
          </Text>
          
          <View style={styles.imageContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.uploadedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 3 && (
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                <Text style={styles.addImageText}>添加圖片</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 聯繫方式 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>聯繫方式（選填）</Text>
          <Text style={styles.sectionHint}>
            如需回覆，請留下您的 Email 或電話
          </Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.input}
              value={contactInfo}
              onChangeText={setContactInfo}
              placeholder="your.email@example.com 或 0912345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* 提交按鈕 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isFormValid ? ['#166CB5', '#31C6FE'] : ['#D1D5DB', '#D1D5DB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>提交回饋</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

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

  // ScrollView
  scrollView: {
    flex: 1,
  },

  // Info Card
  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  sectionHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Type Selection
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typeCardSelected: {
    borderColor: '#166CB5',
    backgroundColor: '#EFF6FF',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeLabelSelected: {
    color: '#166CB5',
  },
  typeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Text Area
  textAreaContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },

  // Image Upload
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 12,
  },

  // Submit Button
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#166CB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  bottomPadding: {
    height: 40,
  },
});

export default Feedback;