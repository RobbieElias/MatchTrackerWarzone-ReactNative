import { AsyncStorage } from 'react-native';

const maxRecents = 10;
const recentsKey = "RECENTS";

export const setRecents = async (recents) => {
  try {
    await AsyncStorage.setItem(recentsKey, JSON.stringify(recents));
  } catch (error) {
    console.log(error);
  }
}

export const getRecents = async () => {
  try {
    let recents = JSON.parse(await AsyncStorage.getItem(recentsKey));
    return !recents ? [] : recents;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export const addToRecents = async (name, username, platform) => {
  let recents = await getRecents();

  let item = {
    name: name,
    username: username,
    platform: platform,
  };
    
  if (recents.length >= maxRecents) {
    recents.pop();
  }

  // Check if object exists in array and remove it if it does
  var index = recents.findIndex(x => x.username.toLowerCase() === username.toLowerCase());
  if (index !== -1) {
    recents.splice(index, 1);
  }

  recents.unshift(item);
    
  await setRecents(recents);
  return recents;
}
