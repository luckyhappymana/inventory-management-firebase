// Parse search text to handle exact match queries (text within quotes)
export function parseSearchQuery(searchText: string): { exactMatch: string | null; partialMatch: string } {
  const matches = searchText.match(/"([^"]+)"/);
  if (matches) {
    // Extract text within quotes for exact match
    const exactMatch = matches[1];
    // Remove the quoted text from the original search string for partial matching
    const partialMatch = searchText.replace(/"[^"]+"/g, '').trim();
    return { exactMatch, partialMatch };
  }
  return { exactMatch: null, partialMatch: searchText };
}

// Check if text matches search criteria (exact or partial)
export function matchesSearchCriteria(text: string, searchQuery: { exactMatch: string | null; partialMatch: string }): boolean {
  if (!text) return false;
  const normalizedText = text.toLowerCase();
  
  // Check exact match first
  if (searchQuery.exactMatch && !normalizedText.includes(searchQuery.exactMatch.toLowerCase())) {
    return false;
  }
  
  // Then check partial match if there's any remaining search text
  if (searchQuery.partialMatch && !normalizedText.includes(searchQuery.partialMatch.toLowerCase())) {
    return false;
  }
  
  return true;
}