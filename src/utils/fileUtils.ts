// src/utils/fileUtils.ts

/**
 * توليد اسم ملف آمن (يزيل الأحرف الخاصة ويضيف التاريخ والوقت)
 * @param baseName الاسم الأساسي (مثل اسم المنشأة أو النشاط)
 * @param extension امتداد الملف (pdf, csv, ...)
 * @returns اسم الملف مع التاريخ والوقت
 */
export const generateFileName = (baseName: string, extension: string): string => {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`;
  const timeStr = `${date.getHours().toString().padStart(2, '0')}-${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
  // إزالة الأحرف غير المسموح بها في أسماء الملفات
  const safeBase = baseName.replace(/[^\u0600-\u06FF\w\s-]/g, '').replace(/\s+/g, '_');
  return `${safeBase}_${dateStr}_${timeStr}.${extension}`;
};