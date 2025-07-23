import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '../../src/theme';
import { StyleSheet } from 'react-native';
import { useFoodLogStore } from '../../src/stores/useFoodLogStore';

interface CreateActionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectText: () => void;
  onSelectPicture: () => void;
  onSelectAudio: () => void;
}

function CreateActionModal({ 
  visible, 
  onClose, 
  onSelectText, 
  onSelectPicture, 
  onSelectAudio 
}: CreateActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.actionItem} onPress={onSelectText}>
            <FontAwesome name="keyboard-o" size={24} color={colors.text.primary} />
            <Text style={styles.actionText}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={onSelectPicture}>
            <FontAwesome name="camera" size={24} color={colors.text.primary} />
            <Text style={styles.actionText}>Picture</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={onSelectAudio}>
            <FontAwesome name="microphone" size={24} color={colors.text.primary} />
            <Text style={styles.actionText}>Audio</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { triggerManualLog, triggerImageCapture, triggerAudioRecord } = useFoodLogStore();

  const handleCreatePress = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleSelectText = () => {
    setShowCreateModal(false);
    // Navigate to Today tab first, then trigger action
    navigation.navigate('index');
    triggerManualLog();
  };

  const handleSelectPicture = () => {
    setShowCreateModal(false);
    // Navigate to Today tab first, then trigger action
    navigation.navigate('index');
    triggerImageCapture();
  };

  const handleSelectAudio = () => {
    setShowCreateModal(false);
    // Navigate to Today tab first, then trigger action
    navigation.navigate('index');
    triggerAudioRecord();
  };

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined 
            ? options.tabBarLabel 
            : options.title !== undefined 
            ? options.title 
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Insert create button between tabs
          if (index === 1) {
            return (
              <React.Fragment key={`${route.key}-fragment`}>
                <TouchableOpacity
                  key={`create-button`}
                  style={styles.createButton}
                  onPress={handleCreatePress}
                >
                  <FontAwesome name="plus" size={20} color={colors.background.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  key={route.key}
                  style={styles.tabItem}
                  onPress={onPress}
                >
                  {options.tabBarIcon && options.tabBarIcon({ 
                    color: isFocused ? colors.brand.primary : colors.text.secondary,
                    size: 24 
                  })}
                  <Text style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.brand.primary : colors.text.secondary }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
            >
              {options.tabBarIcon && options.tabBarIcon({ 
                color: isFocused ? colors.brand.primary : colors.text.secondary,
                size: 24 
              })}
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? colors.brand.primary : colors.text.secondary }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CreateActionModal
        visible={showCreateModal}
        onClose={handleCloseModal}
        onSelectText={handleSelectText}
        onSelectPicture={handleSelectPicture}
        onSelectAudio={handleSelectAudio}
      />
    </>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar-check-o" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bar-chart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: colors.text.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: colors.background.secondary,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
    color: colors.text.primary,
  },
});