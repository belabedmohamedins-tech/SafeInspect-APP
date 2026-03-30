import fullCategories from './facilityCategoriesFull.json';

export interface CategoryItem {
  rubrique: string;
  label: string;
  regime: string;
  radius?: number;
}

// فرض النوع باستخدام as
export const facilityCategories: CategoryItem[] = fullCategories as CategoryItem[];

export const getCategoryLabels = (): string[] => {
  return facilityCategories.map(item => `${item.rubrique} - ${item.label} (${item.regime})`);
};