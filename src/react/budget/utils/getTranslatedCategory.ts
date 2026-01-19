import type { TFunction } from 'i18next';
import { iconifyIcon } from '../config';

// Icon mappings for expense categories
const categoryIcons: Record<string, string> = {
  'rent': 'mdi:home',
  'groceries': 'mdi:cart',
  'utilities': 'mdi:home',
  'transport': 'mdi:car',
  'health': 'mdi:pill',
  'food-delivery': 'mdi:hamburger',
  'fast-food': 'mdi:pizza',
  'subscriptions': 'mdi:cellphone',
  'shopping': 'mdi:shopping',
  'gaming': 'mdi:gamepad-variant',
  'books': 'mdi:book-open-variant',
  'entertainment': 'mdi:party-popper',
  'cash': 'mdi:credit-card'
};

// Icon mappings for allocation categories
const allocationIcons: Record<string, string> = {
  'etf': 'mdi:chart-bar',
  'btc': 'mdi:bitcoin',
  'eth': 'mdi:ethereum'
};

/**
 * Gets translated category name with icon
 */
export function getTranslatedCategoryName(
  categoryId: string,
  t: TFunction
): string {
  const icon = categoryIcons[categoryId] || 'mdi:help-circle';
  const translatedName = t(`categoryNames.${categoryId}`, { defaultValue: categoryId });
  return `${iconifyIcon(icon, '1.2em')} ${translatedName}`;
}

/**
 * Gets translated allocation category name with icon
 */
export function getTranslatedAllocationName(
  allocationId: string,
  t: TFunction
): string {
  const icon = allocationIcons[allocationId] || 'mdi:help-circle';
  const translatedName = t(`allocationNames.${allocationId}`, { defaultValue: allocationId });
  return `${iconifyIcon(icon, '1.2em')} ${translatedName}`;
}
