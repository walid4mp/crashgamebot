import { NavigationItem } from '../components/layout/BottomNavigation';

// Базовые навигационные элементы без переводов
export const NAVIGATION_ITEMS_BASE: Omit<NavigationItem, 'label'>[] = [
  {
    id: 'market',
    icon: 'market',
    path: '/market',
  },
  {
    id: 'cases',
    icon: 'cases',
    path: '/cases',
  },
  {
    id: 'crash',
    icon: 'crash',
    path: '/crash',
  },
  {
    id: 'balance',
    icon: 'balance',
    path: '/balance',
  },
  {
    id: 'earnings',
    icon: 'earnings',
    path: '/earnings',
  },
];

// Функция для получения навигационных элементов с переводами
export const getNavigationItems = (t: (key: string) => string): NavigationItem[] => {
  return NAVIGATION_ITEMS_BASE.map(item => ({
    ...item,
    label: t(`navigation.${item.id}`)
  }));
};

// Убрано дублирование - используем только динамическую версию getNavigationItems

export const DEFAULT_NAVIGATION_ITEM = 'crash';

// Константы для страниц, не отображаемых в нижней навигации
export const ADDITIONAL_PAGES = {
  settings: 'settings',
} as const;