export const getAvailableScreenSpace = () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // In portrait mode, use width as base dimension
  // In landscape mode, use height as base dimension
  if (isPortrait) {
    const dimension = screenWidth;
    return {
      width: dimension,
      height: dimension
    };
  } else {
    const dimension = screenHeight;
    return {
      width: dimension,
      height: dimension
    };
  }
};
