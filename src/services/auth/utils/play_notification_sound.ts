const notification_sound = new Audio('/sounds/notification-chime.wav');

export const play_notification_sound = (): void => {
  notification_sound.currentTime = 0;

  notification_sound.play().catch((error) => {
    console.error('Could not play notification sound: ', error);
  });
};
