/**
 * src/utils/storage.js
 * Asynchronous Local Storage helper functions using @react-native-async-storage/async-storage.
 * Includes defensive try/catch and JSON serialization.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Save data with key
 * @param {string} key
 * @param {*} value
 */
export async function saveData(key, value) {
  try {
    const stringValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error(`[Storage] Error saving key "${key}":`, error);
    return false;
  }
}

/**
 * Retrieve data by key
 * @param {string} key
 * @param {*} defaultValue
 */
export async function getData(key, defaultValue = null) {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    if (rawValue === null || rawValue === undefined) {
      return defaultValue;
    }
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`[Storage] Error retrieving key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove data by key
 * @param {string} key
 */
export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Error removing key "${key}":`, error);
    return false;
  }
}

export default {
  saveData,
  getData,
  removeData,
};
