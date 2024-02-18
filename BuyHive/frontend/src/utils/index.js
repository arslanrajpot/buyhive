export function truncate(inputString) {
    if (inputString.length > 25) {
      return inputString.substring(0, 25) + "...";
    }
    return inputString;
  }