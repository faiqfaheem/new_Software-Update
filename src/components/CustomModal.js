import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

const CustomModal = ({
  visible,
  onClose,
  title,
  message,
  primaryButton,
  secondaryButton,
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Title */}
              {!!title && <Text style={styles.titleText}>{title}</Text>}

              {/* Message */}
              {!!message && <Text style={styles.messageText}>{message}</Text>}

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                {!!secondaryButton && (
                  <TouchableOpacity
                    style={[styles.btn, styles.secondaryBtn]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (secondaryButton.onPress) secondaryButton.onPress();
                      onClose();
                    }}
                  >
                    <Text style={styles.secondaryBtnText}>
                      {secondaryButton.label || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!!primaryButton && (
                  <TouchableOpacity
                    style={[styles.btn, styles.primaryBtn]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (primaryButton.onPress) primaryButton.onPress();
                      onClose();
                    }}
                  >
                    <Text style={styles.primaryBtnText}>
                      {primaryButton.label || 'OK'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 17, 32, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#131C31',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 26,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: '#3B82F6',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CustomModal;
