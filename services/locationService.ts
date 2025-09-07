
export const getLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(position.coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("You denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred."));
              break;
          }
        }
      );
    }
  });
};
