export default function GratitudePractice({ onBack, navigation, onHome }) {
  // ... 現有狀態保持不變
  
  // 添加恢復練習相關狀態（如果還沒有）
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedPractice, setSavedPractice] = useState(null);

  // ==================== 檢查本地草稿 ====================
  useEffect(() => {
    const checkLocalDraft = async () => {
      try {
        const draft = await PracticeStorage.getDraft();
        if (draft) {
          console.log('發現未完成的練習:', draft);
          setSavedPractice(draft);
          setShowRestoreModal(true);
        }
      } catch (error) {
        console.log('檢查本地草稿失敗:', error);
      }
    };
    
    checkLocalDraft();
  }, []);

  // ==================== 自動保存到本地 ====================
  useEffect(() => {
    if (!practiceId || currentPage === 'menu' || currentPage === 'completion') {
      return;
    }

    const autoSave = async () => {
      const draftData = {
        practiceId,
        practiceType: formData.practiceType,
        currentPage,
        currentStep: getCurrentStep(),
        formData,
        elapsedTime,
        savedAt: new Date().toISOString(),
      };

      await PracticeStorage.saveDraft(draftData);
    };

    // 立即保存一次
    autoSave();

    // 設置定時自動保存（每10秒）
    const interval = setInterval(autoSave, 10000);

    return () => clearInterval(interval);
  }, [practiceId, currentPage, formData, elapsedTime]);

  // ==================== 組件卸載時保存 ====================
  useEffect(() => {
    return () => {
      if (practiceId && currentPage !== 'completion' && currentPage !== 'menu') {
        PracticeStorage.saveDraft({
          practiceId,
          practiceType: formData.practiceType,
          currentPage,
          currentStep: getCurrentStep(),
          formData,
          elapsedTime,
          savedAt: new Date().toISOString(),
        });
      }
    };
  }, [practiceId, currentPage, formData, elapsedTime]);

  // ==================== 恢復練習 ====================
  const restorePractice = async () => {
    if (!savedPractice) return;
    
    console.log('恢復練習:', savedPractice);
    
    // 恢復數據
    setFormData(savedPractice.formData);
    setPracticeId(savedPractice.practiceId);
    setElapsedTime(savedPractice.elapsedTime || 0);
    setStartTime(Date.now());
    setIsTiming(true);
    
    // 直接跳轉到保存的頁面
    if (savedPractice.currentPage && savedPractice.currentPage !== 'menu') {
      setCurrentPage(savedPractice.currentPage);
    } else {
      // 如果沒有保存頁面信息，根據步驟跳轉
      const { practiceType, currentStep } = savedPractice;
      
      if (practiceType === PRACTICE_TYPES.DIARY) {
        if (currentStep >= 2) setCurrentPage('diary-feeling');
        else if (currentStep >= 1) setCurrentPage('diary-write');
        else setCurrentPage('diary-intro');
      } else if (practiceType === PRACTICE_TYPES.LETTER) {
        if (currentStep >= 2) setCurrentPage('letter-message');
        else if (currentStep >= 1) setCurrentPage('letter-recipient');
        else setCurrentPage('letter-intro');
      } else if (practiceType === PRACTICE_TYPES.IF) {
        if (currentStep >= 2) setCurrentPage('if-appreciate');
        else if (currentStep >= 1) setCurrentPage('if-imagine');
        else setCurrentPage('if-intro');
      }
    }
    
    setShowRestoreModal(false);
  };

  // ==================== 放棄恢復 ====================
  const discardSavedPractice = async () => {
    await PracticeStorage.clearDraft();
    setSavedPractice(null);
    setShowRestoreModal(false);
  };

  // ==================== 修改完成函數 ====================
  const handleComplete = async () => {
    let totalSeconds = elapsedTime || 60;

    const practiceTypeMap = {
      [PRACTICE_TYPES.DIARY]: '感恩日記',
      [PRACTICE_TYPES.LETTER]: '迷你感謝信',
      [PRACTICE_TYPES.IF]: '如果練習',
    };

    const payloadFormData = {
      ...formData,
      timestamp: Date.now(),
    };

    try {
      await ApiService.completePractice(practiceId, {
        practice_type: practiceTypeMap[formData.practiceType] || '感恩練習',
        duration: Math.max(1, Math.ceil(totalSeconds / 60)),
        duration_seconds: totalSeconds,
        form_data: payloadFormData,
      });

      // 完成後清除本地草稿
      await PracticeStorage.clearDraft();
      console.log('練習完成，本地草稿已清除');
    } catch (error) {
      console.error('完成練習失敗:', error);
      throw error;
    }
  };

  // ==================== 修改返回主頁函數 ====================
  const handleBackToHome = async () => {
    // 如果在練習過程中返回，保存草稿
    if (practiceId && currentPage !== 'completion' && currentPage !== 'menu') {
      await PracticeStorage.saveDraft({
        practiceId,
        practiceType: formData.practiceType,
        currentPage,
        currentStep: getCurrentStep(),
        formData,
        elapsedTime,
        savedAt: new Date().toISOString(),
      });
      console.log('返回前已保存草稿');
    }

    // 執行返回邏輯
    if (onHome) {
      onHome();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    } else if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  // ==================== 恢復練習彈窗 ====================
  const RestoreModal = () => {
    const getPracticeTypeName = () => {
      if (savedPractice?.practiceType === PRACTICE_TYPES.DIARY) return '感恩日記';
      if (savedPractice?.practiceType === PRACTICE_TYPES.LETTER) return '迷你感謝信';
      if (savedPractice?.practiceType === PRACTICE_TYPES.IF) return '如果練習';
      return '感恩練習';
    };

    const getTimeSince = () => {
      if (!savedPractice?.savedAt) return '';
      
      const savedTime = new Date(savedPractice.savedAt);
      const now = new Date();
      const diffMs = now - savedTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffMins < 1) {
        return '剛剛';
      } else if (diffMins < 60) {
        return `${diffMins} 分鐘前`;
      } else if (diffHours < 24) {
        return `${diffHours} 小時前`;
      } else {
        return '昨天';
      }
    };

    return (
      <Modal
        visible={showRestoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {}}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>發現未完成的練習</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.restoreModalText}>
                你有一個{getTimeSince()}保存的{getPracticeTypeName()}，要繼續完成嗎？
              </Text>
            </View>

            <View style={styles.restoreModalButtons}>
              <TouchableOpacity 
                onPress={discardSavedPractice} 
                style={[styles.restoreModalButton, styles.restoreModalButtonSecondary]}
              >
                <Text style={styles.restoreModalButtonTextSecondary}>開始新的</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={restorePractice} 
                style={[styles.restoreModalButton, styles.restoreModalButtonPrimary]}
              >
                <LinearGradient 
                  colors={['#0ea5e9', '#0ea5e9']} 
                  style={styles.restoreModalButtonGradient}
                >
                  <Text style={styles.restoreModalButtonTextPrimary}>繼續完成</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ==================== 主渲染 ====================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f9ff" />
      
      {/* 添加恢復練習彈窗 */}
      <RestoreModal />
      
      {currentPage === 'menu' && renderMenuPage()}
      
      {/* ... 其餘頁面保持不變 */}
    </View>
  );
}