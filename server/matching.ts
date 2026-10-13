import { PublishedItem, ItemMatch } from '../src/types/index';

export function calculateMatchScore(lost: PublishedItem, found: PublishedItem): {
  score: number;
  breakdown: {
    category: number;
    keywords: number;
    location: number;
    brand: number;
    color: number;
    date: number;
  };
  reasons: string[];
} {
  let scoreCategory = 0;
  let scoreKeywords = 0;
  let scoreLocation = 0;
  let scoreBrand = 0;
  let scoreColor = 0;
  let scoreDate = 0;
  const reasons: string[] = [];

  // 1. Category (30%)
  if (lost.categoryId && found.categoryId && lost.categoryId === found.categoryId) {
    scoreCategory = 30;
    reasons.push('Same category: ' + (lost.categoryName || lost.categoryId));
  }

  // 2. Name & Keywords (20%)
  const cleanLostTitle = (lost.title + ' ' + (lost.description || '')).toLowerCase();
  const cleanFoundTitle = (found.title + ' ' + (found.description || '')).toLowerCase();

  const lostWords = cleanLostTitle
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2);

  let matchedWordsCount = 0;
  for (const word of lostWords) {
    if (cleanFoundTitle.includes(word)) {
      matchedWordsCount++;
    }
  }

  if (lostWords.length > 0) {
    const wordRatio = Math.min(1, matchedWordsCount / Math.min(lostWords.length, 5));
    scoreKeywords = Math.round(wordRatio * 20);
    if (scoreKeywords > 8) {
      reasons.push(`Keywords matched (${matchedWordsCount} terms)`);
    }
  }

  // 3. Location (20%)
  if (lost.location && found.location) {
    if (lost.location.district && found.location.district) {
      if (lost.location.district.toLowerCase() === found.location.district.toLowerCase()) {
        scoreLocation = 15;
        if (lost.location.sector && found.location.sector && 
            lost.location.sector.toLowerCase() === found.location.sector.toLowerCase()) {
          scoreLocation = 20;
          reasons.push(`Exact Sector match: ${lost.location.sector}, ${lost.location.district}`);
        } else {
          reasons.push(`Same District: ${lost.location.district}`);
        }
      } else if (lost.location.province && found.location.province &&
                 lost.location.province.toLowerCase() === found.location.province.toLowerCase()) {
        scoreLocation = 8;
        reasons.push(`Same Province: ${lost.location.province}`);
      }
    }
  }

  // 4. Brand (10%)
  if (lost.brand && found.brand) {
    if (lost.brand.trim().toLowerCase() === found.brand.trim().toLowerCase()) {
      scoreBrand = 10;
      reasons.push(`Same brand: ${lost.brand}`);
    }
  } else if (!lost.brand && !found.brand) {
    scoreBrand = 5;
  }

  // 5. Color (10%)
  if (lost.color && found.color) {
    if (lost.color.trim().toLowerCase() === found.color.trim().toLowerCase()) {
      scoreColor = 10;
      reasons.push(`Same color: ${lost.color}`);
    }
  } else if (!lost.color && !found.color) {
    scoreColor = 5;
  }

  // 6. Date proximity (10%)
  if (lost.date && found.date) {
    const lostTime = new Date(lost.date).getTime();
    const foundTime = new Date(found.date).getTime();
    const diffDays = Math.abs((foundTime - lostTime) / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      scoreDate = 10;
      reasons.push('Dates within 3 days');
    } else if (diffDays <= 14) {
      scoreDate = 7;
      reasons.push('Dates within 2 weeks');
    } else if (diffDays <= 30) {
      scoreDate = 4;
      reasons.push('Dates within 1 month');
    }
  }

  const totalScore = Math.min(100, scoreCategory + scoreKeywords + scoreLocation + scoreBrand + scoreColor + scoreDate);

  return {
    score: totalScore,
    breakdown: {
      category: scoreCategory,
      keywords: scoreKeywords,
      location: scoreLocation,
      brand: scoreBrand,
      color: scoreColor,
      date: scoreDate
    },
    reasons
  };
}

export function findMatchesForLostItem(lost: PublishedItem, foundList: PublishedItem[]): ItemMatch[] {
  const matches: ItemMatch[] = [];

  for (const found of foundList) {
    if (found.status === 'recovered' || found.status === 'closed') continue;
    const { score, breakdown, reasons } = calculateMatchScore(lost, found);
    if (score >= 40) {
      matches.push({
        id: `match-${lost.id}-${found.id}`,
        lostItem: lost,
        foundItem: found,
        score,
        breakdown,
        reasons,
        status: 'possible'
      });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
