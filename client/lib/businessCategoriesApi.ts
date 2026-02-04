import { CATEGORIES_API_URL } from "./APIConstants";
import type { CategoriesApiResponse, BusinessCategory } from "@shared/api";

/**
 * Fetch business categories from the API
 */
export async function fetchBusinessCategories(): Promise<BusinessCategory[]> {
  try {
    const response = await fetch(CATEGORIES_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CategoriesApiResponse = await response.json();
    
    if (data.statusCode === 200 && data.data?.content) {
      return data.data.content.filter(category => category.isActive);
    } else {
      throw new Error(data.message || 'Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching business categories:', error);
    throw error;
  }
}

/**
 * Get category icon based on category name
 */
export function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();
  
  if (name.includes('food') || name.includes('drink')) {
    return '🍽️';
  } else if (name.includes('retail') || name.includes('shopping')) {
    return '🛍️';
  } else if (name.includes('health') || name.includes('wellness')) {
    return '🏥';
  } else if (name.includes('transport')) {
    return '🚗';
  } else if (name.includes('service')) {
    return '🔧';
  } else if (name.includes('education')) {
    return '🎓';
  } else if (name.includes('entertainment')) {
    return '🎭';
  } else {
    return '📍';
  }
}