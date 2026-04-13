export interface Entity {
  node_type: string;
  passage: string;
  extracted_data: Record<string, any>;
  merge_count?: number;
  chapter?: number;
  paragraph?: number;
  book_link?: string;
}

export interface UndauntedData {
  source_book: string;
  title: string;
  total_unique_entities: number;
  entities: Entity[];
}

// Process the merged KG data for the timeline
export function processTimelineData(data: UndauntedData) {
  const events = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('event') || e.node_type === 'EVENT'
  );

  const people = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('person') ||
    e.node_type === 'PEOPLE'
  );

  const places = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('place') ||
    e.node_type === 'PLACE'
  );

  const teachings = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('teaching') ||
    e.node_type === 'TEACHING'
  );

  const institutions = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('institution') ||
    e.node_type === 'INSTITUTION' ||
    e.node_type === 'ORGANIZATION'
  );

  const communities = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('community') ||
    e.node_type === 'COMMUNITY'
  );

  const concepts = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('concept') ||
    e.node_type === 'CONCEPT'
  );

  const documents = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('document') ||
    e.node_type === 'DOCUMENT'
  );

  const quotes = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('quote') ||
    e.node_type === 'QUOTE'
  );

  // Extract years from events for timeline
  const timelineEvents = events
    .map(e => {
      // Try multiple fields for year/date
      const yearCe = e.extracted_data?.year_ce;
      const dateStr = e.extracted_data?.date || e.extracted_data?.year || '';
      const yearMatch = dateStr.match(/(\d{4})/);

      let year = null;
      if (yearCe && typeof yearCe === 'number') {
        year = yearCe;
      } else if (yearCe && typeof yearCe === 'string') {
        const match = yearCe.match(/(\d{4})/);
        year = match ? parseInt(match[1]) : null;
      } else if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }

      return {
        ...e,
        year,
        date: dateStr || yearCe?.toString() || ''
      };
    })
    .filter((e): e is typeof e & { year: number } => e.year !== null && e.year >= 1700 && e.year <= 2020)
    .sort((a, b) => a.year - b.year);

  // Extract unique topics/keywords for alphabetical navigation
  const allTopics = new Set<string>();
  data.entities.forEach(e => {
    // Extract from event descriptions, teachings, etc.
    const desc = e.extracted_data?.event || e.extracted_data?.description || e.extracted_data?.topic || '';
    // Extract meaningful words (3+ letters, capitalize)
    const words = desc.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    words.forEach((w: string) => allTopics.add(w));
  });

  const topics = Array.from(allTopics).sort();

  // Extract geolocated places
  const geolocatedPlaces = places
    .filter(p => p.extracted_data?.latitude && p.extracted_data?.longitude)
    .map(p => ({
      ...p,
      lat: parseFloat(p.extracted_data.latitude),
      lng: parseFloat(p.extracted_data.longitude),
      name: p.extracted_data?.name || p.extracted_data?.location || 'Unknown'
    }));

  // All places (not just geolocated)
  const allPlaces = places.map(p => ({
    ...p,
    name: p.extracted_data?.name || p.extracted_data?.location || p.passage?.substring(0, 50) || 'Unknown'
  })).sort((a, b) => a.name.localeCompare(b.name));

  return {
    events: timelineEvents,
    people,
    places: geolocatedPlaces,
    allPlaces,
    topics,
    teachings,
    institutions,
    communities,
    concepts,
    documents,
    quotes,
    allEntities: data.entities
  };
}

export const ERAS = [
  {
    id: 'rashab',
    name: 'The Rashab Era',
    years: '1882-1920',
    startYear: 1882,
    endYear: 1920,
    color: '#8B5CF6',
    description: 'Leadership of Rabbi Shalom Dovber (the Rashab)'
  },
  {
    id: 'rayatz-early',
    name: 'Rebbe Rayatz: Early Years',
    years: '1920-1927',
    startYear: 1920,
    endYear: 1927,
    color: '#3B82F6',
    description: 'Leadership begins in communist Russia'
  },
  {
    id: 'exile',
    name: 'Exile & Escape',
    years: '1927-1940',
    startYear: 1927,
    endYear: 1940,
    color: '#EF4444',
    description: 'Arrest, exile to Riga, escape from Warsaw'
  },
  {
    id: 'america',
    name: 'Rebuilding in America',
    years: '1940-1950',
    startYear: 1940,
    endYear: 1950,
    color: '#F59E0B',
    description: 'Arrival in America and rebuilding'
  }
];
