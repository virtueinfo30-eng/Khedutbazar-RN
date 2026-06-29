import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { KHEDUTBAZAR_URL } from '../constants/app';

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } else if (Platform.OS === 'android') {
    if (Number(Platform.Version) >= 33) {
      // Android 13+: shows the native system "Allow / Don't allow" dialog
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        await messaging().requestPermission();
        return true;
      }
      return false;
    }
    // Android 12 and below: notifications are auto-granted
    return true;
  }
  return false;
};

export const getFCMToken = async () => {
  try {
    // iOS requires device registration for remote messages before getToken()
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const saveFCMTokenToServer = async (token: string, apiToken: string) => {
  try {
    const baseUrl = KHEDUTBAZAR_URL.endsWith('/') ? KHEDUTBAZAR_URL : `${KHEDUTBAZAR_URL}/`;
    const response = await fetch(`${baseUrl}api/fcm/save-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        token: token,
        platform: Platform.OS,
      }),
    });
    const result = await response.json();
    console.log('Save FCM token result:', result);
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};
