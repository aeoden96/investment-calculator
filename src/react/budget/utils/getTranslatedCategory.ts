import type { TFunction } from 'react-i18next';

/**
 * Gets translated category name (without icon)
 */
export function getTranslatedCategoryName(
  categoryId: string,
  t: TFunction
): string {
  return t(`categoryNames.${categoryId}`, { defaultValue: categoryId });
}

/**
 * Gets translated allocation category name (without icon)
 */
export function getTranslatedAllocationName(
  allocationId: string,
  t: TFunction
): string {
  return t(`allocationNames.${allocationId}`, { defaultValue: allocationId });
}
