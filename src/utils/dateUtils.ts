// src/utils/dateUtils.ts

/**
 * تنسيق التاريخ مع الوقت (صيغة طويلة)
 * مثال: "الخميس، 15 مارس 2026 14:30"
 */
export const formatDateLong = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * تنسيق التاريخ مع الوقت (صيغة قصيرة)
 * مثال: "2026-03-15 14:30"
 */
export const formatDateTimeShort = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * تنسيق التاريخ فقط (بدون وقت)
 * مثال: "15 مارس 2026"
 */
export const formatDateOnly = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
// داخل src/utils/dateUtils.ts
export const formatDateForAgenda = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('ar-DZ', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * تنسيق التاريخ للعرض في البطاقات (مع الوقت)
 * مثال: "2026-03-15 14:30"
 */
export const formatDateForCard = (isoString: string): string => {
  return formatDateTimeShort(isoString);
};