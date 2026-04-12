export interface Entity {
  node_type: string;
  passage: string;
  extracted_data: Record<string, any>;
  merge_count?: number;
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
    e.node_type.toLowerCase().includes('event')
  );

  const people = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('person') ||
    e.node_type === 'PEOPLE'
  );

  const places = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('place')
  );

  const teachings = data.entities.filter(e =>
    e.node_type.toLowerCase().includes('teaching')
  );

  // Extract years from events for timeline
  const timelineEvents = events
    .map(e => {
      const dateStr = e.extracted_data?.date || e.extracted_data?.year || '';
      const yearMatch = dateStr.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : null;

      return {
        ...e,
        year,
        date: dateStr
      };
    })
    .filter((e): e is typeof e & { year: number } => e.year !== null && e.year >= 1800 && e.year <= 2000)
    .sort((a, b) => a.year - b.year);

  return {
    events: timelineEvents,
    people,
    places,
    teachings,
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
  },
  {
    id: 'ramash',
    name: 'The Ramash Era',
    years: '1950-1994',
    startYear: 1950,
    endYear: 1994,
    color: '#10B981',
    description: 'Leadership of the Rebbe (Ramash)'
  }
];
