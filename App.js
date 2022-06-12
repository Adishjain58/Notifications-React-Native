import { StatusBar } from "expo-status-bar";
import { Alert, Button, StyleSheet, Platform, View } from "react-native";
// package used for sending notifications
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

// to define how the notifications ahould be handled by the device
// reason why it's utside of component is because this function is not required to run all the times
// only one time when the app is loaded is enough
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export default function App() {
  useEffect(() => {
    // function to get the notification permissions
    const configurePushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus != "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus != "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions"
        );
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log(pushTokenData);

      if (Platform.OS === "android") {
        // for android config required for push notification
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };

    configurePushNotifications();
  }, []);

  useEffect(() => {
    // this methods gets triggered whenever a notification is received
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("notification received");
        const userName = notification.request.content.data.userName;
        console.log(userName);
      }
    );

    // this methods gets triggered when user interacted with the notification
    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification interacted");
        const userName = response.notification.request.content.data.userName;
        console.log(userName);
      }
    );
    return () => {
      subscription.remove();
      subscription2.remove();
    };
  }, []);
  const scheduleNotificationHandler = () => {
    // for local notifications i.e. notifications sent by the app on the device where this app is running
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of notification",
        // this won't show to end user but we can extract this data when we handle the notification
        data: { userName: "Max" },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  // function to send a push notification  using expo provided service or api
  const sendPushNotificationHandler = () => {
    const message = {
      // provide the device push token here
      to: "",
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
      />
      <Button
        title="Schedule Push Notification"
        onPress={sendPushNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
