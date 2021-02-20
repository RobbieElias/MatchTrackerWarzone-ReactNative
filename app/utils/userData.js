import { AsyncStorage } from "react-native";
import * as constants from "../config/constants";

const recentsKey = "RECENTS";
const bookmarksKey = "BOOKMARKS";
const profileDataKey = "PROFILE_DATA";

const maxRecents = 10;
const maxBookmarks = 10;
const profileDataLifespan = 600000; // 10 minutes

const equalsIgnoreCase = (a, b) => {
  return a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
};

export const setRecents = async (recents) => {
  try {
    await AsyncStorage.setItem(recentsKey, JSON.stringify(recents));
  } catch (error) {
    console.log(error);
  }
};

export const getRecents = async () => {
  try {
    let recents = JSON.parse(await AsyncStorage.getItem(recentsKey)) ?? [];
    return recents;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const addToRecents = async (username, platform) => {
  // If user is bookmarked, don't add to recents
  if (await isUserBookmarked(username, platform)) return false;

  let recents = await getRecents();

  let name = username;
  if (platform.code === constants.platforms.BATTLENET.code) {
    let lastIndexHashtag = username.lastIndexOf("#");
    name =
      lastIndexHashtag === -1 ? username : username.substr(0, lastIndexHashtag);
  }

  let item = {
    name: name,
    username: username,
    platform: platform,
  };

  if (recents.length >= maxRecents) {
    recents.pop();
  }

  // Check if object exists in array and remove it if it does
  let index = recents.findIndex((recent) =>
    equalsIgnoreCase(recent.username, username)
  );
  if (index !== -1) {
    recents.splice(index, 1);
  }

  recents.unshift(item);

  await setRecents(recents);
  return true;
};

export const setBookmarks = async (bookmarks) => {
  try {
    await AsyncStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  } catch (error) {
    console.log(error);
  }
};

export const getBookmarks = async () => {
  try {
    let bookmarks = JSON.parse(await AsyncStorage.getItem(bookmarksKey)) ?? [];
    return bookmarks;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const isUserBookmarked = async (username, platform, bookmarks = null) => {
  if (bookmarks === null) bookmarks = await getBookmarks();

  if (
    bookmarks.some(
      (bookmark) =>
        equalsIgnoreCase(bookmark.username, username) &&
        bookmark.platform.code === platform.code
    )
  ) {
    return true;
  }

  return false;
};

export const addToBookmarks = async (username, platform) => {
  let bookmarks = await getBookmarks();
  let recents = await getRecents();

  // Don't add if bookmark already exists
  if (
    bookmarks.some(
      (bookmark) =>
        equalsIgnoreCase(bookmark.username, username) &&
        bookmark.platform.code === platform.code
    )
  ) {
    return false;
  }

  // Remove from recents if it exists there
  let index = recents.findIndex(
    (recent) =>
      equalsIgnoreCase(recent.username, username) &&
      recent.platform.code === platform.code
  );
  if (index !== -1) {
    recents.splice(index, 1);
    setRecents(recents);
  }

  let name = username;
  if (platform.code === constants.platforms.BATTLENET.code) {
    let lastIndexHashtag = username.lastIndexOf("#");
    name =
      lastIndexHashtag === -1 ? username : username.substr(0, lastIndexHashtag);
  }

  let item = {
    name: name,
    username: username,
    platform: platform,
  };

  if (bookmarks.length >= maxBookmarks) {
    return false;
  }

  bookmarks.push(item);

  await setBookmarks(bookmarks);
  return true;
};

export const removeFromBookmarks = async (username, platform) => {
  let bookmarks = await getBookmarks();

  // Remove from bookmarks if it exists there
  let index = bookmarks.findIndex(
    (bookmark) =>
      equalsIgnoreCase(bookmark.username, username) &&
      bookmark.platform.code === platform.code
  );
  if (index !== -1) {
    bookmarks.splice(index, 1);
    setBookmarks(bookmarks);
    return true;
  }

  return false;
};

export const getRecentsList = async () => {
  let bookmarks = await getBookmarks();
  let recents = await getRecents();

  return bookmarks
    .map((bookmark) => ({
      ...bookmark,
      isBookmarked: true,
    }))
    .concat(
      recents.map((recent) => ({
        ...recent,
        isBookmarked: false,
      }))
    );
};

export const getCachedProfileData = async (username = null, platform = null) => {
  let profileDataArray = [];
  try {
    profileDataArray = JSON.parse(
      await AsyncStorage.getItem(profileDataKey)
    ) ?? [];
    if (username === null || platform === null) {
      return profileDataArray;
    }
  } catch (error) {
    console.log(error);
    if (username === null || platform === null) {
      return [];
    }
  }

  // If we reach here, both username and platform are set
  let curDateMillis = Date.now();

  return profileDataArray.find((profileData) =>
    equalsIgnoreCase(profileData.username, username) &&
    profileData.platformCode === platform.code &&
    profileData.dateStored+profileDataLifespan >= curDateMillis
  ) ?? null;
};

export const cacheProfileData = async (username, platform, data) => {
  let profileDataArray = await getCachedProfileData();
  let curDateMillis = Date.now();

  // Remove old entries first
  for (let i = 0; i < profileDataArray.length; i++) {
    if (
      curDateMillis > profileDataArray[i].dateStored + profileDataLifespan ||
      (username === profileDataArray[i].username &&
        platform.code === profileDataArray[i].platformCode)
    ) {
      profileDataArray.splice(i, 1);
    }
  }

  // Cache data for only 5 profiles
  while (profileDataArray.length >= 5) profileDataArray.splice(0, 1); 

  profileDataArray.push({
    username: username,
    platformCode: platform.code,
    data: data,
    dateStored: curDateMillis,
  });

  try {
    await AsyncStorage.setItem(
      profileDataKey,
      JSON.stringify(profileDataArray)
    );
  } catch (error) {
    console.log(error);
  }
};
