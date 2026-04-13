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
  // Helper function to add descriptive name to entities
  const addName = (entity: Entity) => {
    const type = entity.node_type;
    let name = '';

    switch (type) {
      case 'PEOPLE':
        name = entity.extracted_data?.name || entity.passage?.substring(0, 50) || 'Unknown Person';
        break;
      case 'EVENT':
        // Use passage for event names (they're poorly extracted)
        let passage = entity.passage || '';
        passage = passage.trim().replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '');
        passage = passage.charAt(0).toUpperCase() + passage.slice(1);
        name = passage.length > 120 ? passage.substring(0, 117) + '...' : passage;
        break;
      case 'PLACE':
        name = entity.extracted_data?.name || entity.extracted_data?.location || entity.passage?.substring(0, 50) || 'Unknown Place';
        break;
      case 'QUOTE':
        const quote = entity.passage || '';
        name = quote.length > 80 ? quote.substring(0, 77) + '...' : quote;
        break;
      case 'CONCEPT':
      case 'TEACHING':
        name = entity.extracted_data?.teaching || entity.extracted_data?.concept || entity.extracted_data?.topic || entity.passage?.substring(0, 50) || 'Unknown Teaching';
        break;
      case 'INSTITUTION':
        name = entity.extracted_data?.name || entity.extracted_data?.institution || entity.passage?.substring(0, 50) || 'Unknown Institution';
        break;
      case 'DATE':
        name = entity.extracted_data?.date || entity.extracted_data?.year_ce?.toString() || entity.passage?.substring(0, 30) || 'Unknown Date';
        break;
      default:
        name = entity.extracted_data?.name || entity.extracted_data?.description || entity.passage?.substring(0, 50) || 'Unknown';
    }

    return {
      ...entity,
      name: name || 'Unknown'
    };
  };

  const events = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('event') || e.node_type === 'EVENT'
  ).map(addName);

  const people = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('person') ||
    e.node_type === 'PEOPLE'
  ).map(addName);

  const places = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('place') ||
    e.node_type === 'PLACE'
  ).map(addName);

  const teachings = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('teaching') ||
    e.node_type === 'TEACHING' ||
    e.node_type === 'CONCEPT'  // Map CONCEPT to TEACHINGS
  ).map(addName);

  const institutions = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('institution') ||
    e.node_type === 'INSTITUTION' ||
    e.node_type === 'ORGANIZATION'
  ).map(addName);

  const communities = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('community') ||
    e.node_type === 'COMMUNITY'
  ).map(addName);

  const concepts = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('concept') ||
    e.node_type === 'CONCEPT'
  ).map(addName);

  const documents = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('document') ||
    e.node_type === 'DOCUMENT'
  ).map(addName);

  const quotes = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('quote') ||
    e.node_type === 'QUOTE'
  ).map(addName);

  // Extract years from events for timeline (only events with valid years)
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

  // All events with year data for display (events don't need years to be shown)
  const allEvents = events
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

      // Create a better name from passage - clean up and truncate
      let passage = e.passage || '';
      // Remove leading/trailing whitespace and quotes
      passage = passage.trim().replace(/^["'\u201C\u201D]+|["'\u201C\u201D]+$/g, '');
      // Capitalize first letter
      passage = passage.charAt(0).toUpperCase() + passage.slice(1);
      // Truncate to reasonable length
      const name = passage.length > 120 ? passage.substring(0, 117) + '...' : passage;

      return {
        ...e,
        year,
        name: name || 'Unknown Event'
      };
    });

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

  // Add name property to all entities for consistent display
  const allEntities = data.entities.map(addName);

  return {
    events: timelineEvents,
    allEvents,  // All events for counting/browsing, regardless of year data
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
    allEntities
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
