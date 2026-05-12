import { useEffect } from 'react';
import { Platform } from 'react-native';
import { authApi } from '../api/client';

export default function usePushNotifications(user) {
  useEffect(() => {
    if (!user) return;
    if (Platform.OS === 'web') return; // Web'de push desteklenmez

    async function registerToken() {
      try {
        const Notifications = await import('expo-notifications');
        const Device = await import('expo-device');

        if (!Device.isDevice) return; // Emülatörde çalışmaz

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
          });
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        await authApi.savePushToken(tokenData.data).catch(() => {});
      } catch {
        // push kayıt hatası sessizce geçilir
      }
    }

    registerToken();
  }, [user]);
}
