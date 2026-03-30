// src/facilitiesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { facilities as hardcodedFacilities } from './facilitiesData';
import { Facility } from './types';

const USER_FACILITIES_KEY = 'userFacilities';

// الحصول على جميع المنشآت (الثابتة + المضافة من المستخدم)
export const getAllFacilities = async (): Promise<Facility[]> => {
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  const userFacilities: Facility[] = userFacilitiesJson ? JSON.parse(userFacilitiesJson) : [];
  return [...hardcodedFacilities, ...userFacilities];
};

// الحصول على منشأة معينة بواسطة id (تبحث في الثابتة ثم المضافة)
export const getFacilityById = async (id: string): Promise<Facility | null> => {
  // ابحث أولاً في المنشآت الثابتة
  const hardcoded = hardcodedFacilities.find(f => f.id === id);
  if (hardcoded) return hardcoded;

  // ثم ابحث في المنشآت المضافة من المستخدم
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (userFacilitiesJson) {
    const userFacilities: Facility[] = JSON.parse(userFacilitiesJson);
    const userFacility = userFacilities.find(f => f.id === id);
    if (userFacility) return userFacility;
  }

  return null;
};

// الحصول فقط على المنشآت المضافة من المستخدم
export const getUserFacilities = async (): Promise<Facility[]> => {
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  return userFacilitiesJson ? JSON.parse(userFacilitiesJson) : [];
};

// إضافة منشأة جديدة (يتم إنشاء id فريد)
export const addUserFacility = async (facility: Facility): Promise<void> => {
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  const userFacilities: Facility[] = userFacilitiesJson ? JSON.parse(userFacilitiesJson) : [];
  
  // إنشاء رقم فريد للمنشأة (بادئة U + وقت + راندوم)
  const newId = 'U' + Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5);
  facility.id = newId;
  
  userFacilities.push(facility);
  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(userFacilities));
};

// تحديث منشأة موجودة (يجب أن تكون مضافة من المستخدم، لأن الثابتة لا يمكن تعديلها)
export const updateUserFacility = async (id: string, updatedData: Partial<Facility>): Promise<boolean> => {
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (!userFacilitiesJson) return false;

  const userFacilities: Facility[] = JSON.parse(userFacilitiesJson);
  const index = userFacilities.findIndex(f => f.id === id);
  if (index === -1) return false; // غير موجود أو منشأة ثابتة

  // تحديث الحقول المطلوبة فقط (دمج البيانات القديمة مع الجديدة)
  userFacilities[index] = { ...userFacilities[index], ...updatedData };
  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(userFacilities));
  return true;
};

// حذف منشأة (فقط المضافة من المستخدم)
export const deleteUserFacility = async (id: string): Promise<boolean> => {
  const userFacilitiesJson = await AsyncStorage.getItem(USER_FACILITIES_KEY);
  if (!userFacilitiesJson) return false;

  const userFacilities: Facility[] = JSON.parse(userFacilitiesJson);
  const updated = userFacilities.filter(f => f.id !== id);
  if (updated.length === userFacilities.length) return false; // لم يتم حذف أي شيء

  await AsyncStorage.setItem(USER_FACILITIES_KEY, JSON.stringify(updated));
  return true;
};

// (اختياري) حذف جميع المنشآت المضافة من المستخدم
export const clearAllUserFacilities = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_FACILITIES_KEY);
};