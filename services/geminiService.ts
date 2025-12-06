import { GoogleGenAI } from "@google/genai";
import { Restaurant, Dish } from '../types';

interface GeminiRecommendation {
  type: 'restaurant' | 'dish';
  id: string;
  reason: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  getRestaurantRecommendations: async (
    userPreferences: string[],
    pastOrderCuisines: string[],
    allRestaurants: Restaurant[],
  ): Promise<Restaurant[]> => {
    const combinedKeywords = [...new Set([...userPreferences, ...pastOrderCuisines])].join(', ');
    const restaurantList = allRestaurants.map(r => `${r.name} (${r.cuisine.join(', ')})`).join('; ');

    const prompt = `Given the user's preferences: "${combinedKeywords}" and available restaurants: "${restaurantList}".
    Suggest 3-5 restaurants that the user might like. For each suggestion, provide the restaurant name and a brief reason.
    Respond in a JSON array format like:
    [
      {"name": "Restaurant Name 1", "reason": "Reason 1"},
      {"name": "Restaurant Name 2", "reason": "Reason 2"}
    ]`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                name: { type: "STRING" },
                reason: { type: "STRING" }
              }
            }
          }
        }
      });

      const text = response.text?.trim();
      if (!text) {
        console.warn('Gemini returned no text for restaurant recommendations.');
        return [];
      }

      const rawRecommendations: { name: string; reason: string }[] = JSON.parse(text);
      const recommendedRestaurants = rawRecommendations
        .map(rec => allRestaurants.find(r => r.name.toLowerCase() === rec.name.toLowerCase()))
        .filter((r): r is Restaurant => r !== undefined);

      return recommendedRestaurants;

    } catch (error) {
      console.error('Error fetching restaurant recommendations from Gemini:', error);
      // Fallback to a random selection or empty array
      return [];
    }
  },

  getDishDescriptionEnhancement: async (dish: Dish): Promise<string> => {
    const prompt = `Enhance the description for "${dish.name}" from ${dish.restaurantId}.
    Current description: "${dish.description}".
    Provide a more enticing and detailed description, focusing on key ingredients and taste profile. Max 50 words.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          temperature: 0.8,
          maxOutputTokens: 100, // Sufficient for ~50 words
          thinkingConfig: { thinkingBudget: 25 },
        },
      });

      const text = response.text?.trim();
      return text || dish.description; // Return original if Gemini fails or returns empty

    } catch (error) {
      console.error(`Error enhancing dish description for ${dish.name}:`, error);
      return dish.description;
    }
  },

  // Placeholder for smart reorder suggestions based on past orders
  getSmartReorderSuggestions: async (userId: string, pastOrders: Dish[]): Promise<Dish[]> => {
    // In a real app, this would consider frequency, last ordered date, etc.
    // For now, let's just pick a few popular items or items from past orders.
    const uniquePastDishes = Array.from(new Map(pastOrders.map(dish => [dish.id, dish])).values());
    if (uniquePastDishes.length > 3) {
      return uniquePastDishes.slice(0, 3);
    }
    // Fallback to some default popular dishes if past orders are few
    return uniquePastDishes.length > 0 ? uniquePastDishes : [
        {
          id: 'd1', restaurantId: 'r1', name: 'Spaghetti Carbonara',
          description: 'Classic spaghetti with egg, hard cheese, cured pork, and black pepper.',
          price: 18.00, imageUrl: 'https://picsum.photos/300/200?random=101', isVeg: false, inStock: true,
        },
        {
          id: 'd4', restaurantId: 'r2', name: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken pieces, a mild Indian classic.',
          price: 16.50, imageUrl: 'https://picsum.photos/300/200?random=104', isVeg: false, inStock: true,
        },
      ];
  },
};
