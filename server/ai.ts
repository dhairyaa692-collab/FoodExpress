import { GoogleGenAI } from '@google/genai';
import { db, FoodItem, Order } from './db.js';

export interface CravingRecommendation {
  foodItem: FoodItem;
  reason: string;
  confidenceScore: number; // 0 - 100
  cravingTag: string; // e.g. "Weekend Favorite", "Spicy Craving", "Comfort Bite", "Popular Pick"
}

export interface CravingResponse {
  isPersonalized: boolean;
  userPromptOrPreference?: string;
  recommendations: CravingRecommendation[];
  summaryMessage: string;
  patternsIdentified?: string[];
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Heuristic prediction engine: analyzes order counts, category frequency, recency, and day-of-week
 */
export function generateHeuristicRecommendations(
  userOrders: Order[],
  allFood: FoodItem[],
  preferences?: string[]
): CravingResponse {
  const availableFood = allFood.filter((f) => f.isAvailable);

  // Case 1: New user or no previous orders
  if (!userOrders || userOrders.length === 0) {
    let candidateDishes = [...availableFood];

    if (preferences && preferences.length > 0) {
      const lowerPrefs = preferences.map((p) => p.toLowerCase());
      candidateDishes.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        for (const pref of lowerPrefs) {
          if (a.category.toLowerCase().includes(pref) || a.description.toLowerCase().includes(pref) || a.name.toLowerCase().includes(pref)) {
            scoreA += 10;
          }
          if (b.category.toLowerCase().includes(pref) || b.description.toLowerCase().includes(pref) || b.name.toLowerCase().includes(pref)) {
            scoreB += 10;
          }
          if (pref.includes('veg') && a.isVeg) scoreA += 5;
          if (pref.includes('veg') && b.isVeg) scoreB += 5;
        }
        return scoreB + b.popularity - (scoreA + a.popularity);
      });

      const selected = candidateDishes.slice(0, 4);
      return {
        isPersonalized: false,
        userPromptOrPreference: preferences.join(', '),
        summaryMessage: `Curated for your current preferences (${preferences.join(', ')}). As you place orders, FoodExpress AI will learn your unique taste patterns!`,
        recommendations: selected.map((item) => ({
          foodItem: item,
          reason: `Top recommendation matching your interest in ${preferences[0] || 'good food'} with high ${item.rating}★ rating.`,
          confidenceScore: 82,
          cravingTag: 'Preference Match',
        })),
        patternsIdentified: [
          'No order history yet; baseline populated from customer ratings and your chosen mood.',
        ],
      };
    }

    // Default popular dishes for brand new visitors
    const topPopular = [...availableFood].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    return {
      isPersonalized: false,
      summaryMessage: 'Welcome to FoodExpress! Here are today\'s most ordered and highest rated dishes. Pick your flavor preference or order your first meal to train your personalized AI craving predictor.',
      recommendations: topPopular.map((item) => ({
        foodItem: item,
        reason: `Trending crowd favorite with a ${item.rating}★ rating from FoodExpress foodies.`,
        confidenceScore: 80,
        cravingTag: 'Crowd Favorite',
      })),
      patternsIdentified: [
        'Awaiting your first order to unlock deep flavor and timing predictions.',
      ],
    };
  }

  // Case 2: User has past orders!
  // Count frequency of foods and categories
  const foodFrequency: Record<string, number> = {};
  const categoryFrequency: Record<string, number> = {};
  const dayOfWeekCount: Record<number, number> = {};
  let totalVegCount = 0;
  let totalNonVegCount = 0;

  userOrders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const day = orderDate.getDay();
    dayOfWeekCount[day] = (dayOfWeekCount[day] || 0) + 1;

    order.items.forEach((item) => {
      foodFrequency[item.foodId] = (foodFrequency[item.foodId] || 0) + item.quantity;
      if (item.isVeg) totalVegCount += item.quantity;
      else totalNonVegCount += item.quantity;

      // Find category
      const foodRef = allFood.find((f) => f.id === item.foodId);
      if (foodRef) {
        categoryFrequency[foodRef.category] = (categoryFrequency[foodRef.category] || 0) + item.quantity;
      }
    });
  });

  const topCategory = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostOrderedFoodId = Object.entries(foodFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
  const todayDay = new Date().getDay();
  const isWeekend = todayDay === 0 || todayDay === 6;

  const patterns: string[] = [];
  if (topCategory) {
    patterns.push(`Strong affinity for ${topCategory} cuisine (${categoryFrequency[topCategory]} items ordered).`);
  }
  if (isWeekend) {
    patterns.push('Weekend treat pattern detected — higher craving probability for comfort and sharing platters.');
  }
  if (totalVegCount > totalNonVegCount * 2) {
    patterns.push('Predominantly vegetarian food choices.');
  }

  // Score candidate foods
  const scoredItems = availableFood.map((food) => {
    let score = food.popularity * 0.2; // base score

    // Ordered before boost
    const timesOrdered = foodFrequency[food.id] || 0;
    if (timesOrdered > 0) {
      score += Math.min(timesOrdered * 18, 50);
    }

    // Category affinity boost
    if (topCategory && food.category === topCategory) {
      score += 25;
    }

    // Vegetaran affinity
    if (totalVegCount > totalNonVegCount && food.isVeg) {
      score += 10;
    }

    // Weekend comfort foods (Pizza & Burger & Snacks)
    if (isWeekend && (food.category === 'Burger' || food.category === 'Pizza' || food.category === 'Snacks')) {
      score += 15;
    }

    // Complementary pairing: if they frequently order spicy food, suggest a dessert or beverage
    if (food.category === 'Beverages' || food.category === 'Desserts') {
      score += 12;
    }

    return {
      food,
      score,
      timesOrdered,
    };
  });

  scoredItems.sort((a, b) => b.score - a.score);
  const selected = scoredItems.slice(0, 4);

  const recommendations: CravingRecommendation[] = selected.map((item, idx) => {
    let reason = '';
    let tag = 'Smart Pick';

    if (item.timesOrdered > 0) {
      tag = 'Repeat Favorite';
      reason = `You have ordered this ${item.timesOrdered} time${item.timesOrdered > 1 ? 's' : ''} previously. It consistently matches your palate.`;
    } else if (item.food.category === topCategory) {
      tag = `${topCategory} Craving`;
      reason = `Because you love ${topCategory} food, our chef thinks you will savor this top-rated ${item.food.name}.`;
    } else if (isWeekend && (item.food.category === 'Burger' || item.food.category === 'Pizza')) {
      tag = 'Weekend Craving';
      reason = 'You frequently indulge in comfort classics on weekends.';
    } else if (item.food.category === 'Beverages' || item.food.category === 'Desserts') {
      tag = 'Perfect Pairing';
      reason = 'A refreshing accompaniment that complements your frequent meal choices.';
    } else {
      tag = 'Chef Pick';
      reason = `Highly recommended for you with a ${item.food.rating}★ rating.`;
    }

    return {
      foodItem: item.food,
      reason,
      confidenceScore: Math.min(Math.round(80 + (4 - idx) * 4), 98),
      cravingTag: tag,
    };
  });

  return {
    isPersonalized: true,
    summaryMessage: `AI analyzed your ${userOrders.length} previous order${userOrders.length > 1 ? 's' : ''} across ${Object.keys(categoryFrequency).length} categories. Here is your predicted craving forecast!`,
    recommendations,
    patternsIdentified: patterns,
  };
}

/**
 * Predict cravings with Gemini AI if API key is active, or fallback seamlessly to heuristic
 */
export async function getAiCravingPredictions(
  userId: string | null,
  preferences?: string[]
): Promise<CravingResponse> {
  const allFood = db.getFoodItems();
  const availableFood = allFood.filter((f) => f.isAvailable);

  const userOrders = userId ? db.getUserOrders(userId) : [];

  // If no user orders and no preferences, or fallback
  const baseResult = generateHeuristicRecommendations(userOrders, allFood, preferences);

  // Check if Gemini is available to elevate the reasoning
  const ai = getGeminiClient();
  if (!ai || userOrders.length === 0) {
    return baseResult;
  }

  try {
    const simplifiedOrders = userOrders.slice(0, 5).map((o) => ({
      date: o.createdAt,
      items: o.items.map((i) => i.name),
      total: o.totalAmount,
    }));

    const simplifiedMenu = availableFood.map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      price: f.price,
      isVeg: f.isVeg,
    }));

    const prompt = `You are the FoodExpress AI Craving Predictor.
Analyze this customer's order history:
${JSON.stringify(simplifiedOrders, null, 2)}

Available Food Menu items:
${JSON.stringify(simplifiedMenu, null, 2)}

Current Day/Time: ${new Date().toISOString()}

Select exactly 3 to 4 recommended dishes that this user is most likely to crave right now.
For each dish, explain the exact reasoning based on their previous food choices, timing, or complementary taste combinations (e.g. "You frequently order spicy burgers on weekend evenings, and this loaded burger matches your palate").

Respond ONLY in valid JSON with this schema:
{
  "summaryMessage": "string summarizing taste profile and craving insight",
  "patternsIdentified": ["string array of 2-3 specific behavioral patterns"],
  "recommendations": [
    {
      "foodId": "string matching an id from available menu",
      "reason": "personalized rationale under 25 words",
      "confidenceScore": number between 80 and 99,
      "cravingTag": "short 2-3 word tag like 'Weekend Craving', 'Spicy Delight', 'Comfort Pick', or 'Sweet Ending'"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length >= 3) {
      const enrichedRecommendations: CravingRecommendation[] = [];

      for (const rec of parsed.recommendations) {
        const item = availableFood.find((f) => f.id === rec.foodId);
        if (item) {
          enrichedRecommendations.push({
            foodItem: item,
            reason: rec.reason || `Personalized pick based on your past orders.`,
            confidenceScore: rec.confidenceScore || 92,
            cravingTag: rec.cravingTag || 'AI Recommendation',
          });
        }
      }

      if (enrichedRecommendations.length >= 3) {
        return {
          isPersonalized: true,
          summaryMessage: parsed.summaryMessage || baseResult.summaryMessage,
          patternsIdentified: parsed.patternsIdentified || baseResult.patternsIdentified,
          recommendations: enrichedRecommendations,
        };
      }
    }
  } catch (err) {
    console.warn('Gemini AI craving analysis note (using heuristic fallback):', err);
  }

  return baseResult;
}
