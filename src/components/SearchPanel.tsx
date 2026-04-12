import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, User, Calendar, MapPin } from 'lucide-react';

interface SearchPanelProps {
  entities: any[];
  events: any[];
  onSelectEvent: (event: any) => void;
  onSelectPerson: (person: any) => void;
}

export default function SearchPanel({ entities, events, onSelectEvent, onSelectPerson }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'events' | 'people' | 'places'>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    let filtered = entities;

    if (filter === 'events') {
      filtered = events;
    } else if (filter === 'people') {
      filtered = entities.filter(e => e.node_type?.toLowerCase().includes('person'));
    } else if (filter === 'places') {
      filtered = entities.filter(e => e.node_type?.toLowerCase().includes('place'));
    }

    return filtered
      .filter(e => {
        const passage = (e.passage || '').toLowerCase();
        const name = (e.extracted_data?.name || '').toLowerCase();
        const desc = (e.extracted_data?.description || '').toLowerCase();
        const event = (e.extracted_data?.event || '').toLowerCase();
        return passage.includes(q) || name.includes(q) || desc.includes(q) || event.includes(q);
      })
      .slice(0, 50);
  }, [query, filter, entities, events]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Search Input */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, people, places..."
              className="w-full pl-12 pr-12 py-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            {(['all', 'events', 'people', 'places'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                  filter === f
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {query && results.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No results found for "{query}"
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-4 text-sm text-slate-500">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="space-y-3">
            {results.map((item, index) => {
              const isEvent = item.node_type?.toLowerCase().includes('event');
              const isPerson = item.node_type?.toLowerCase().includes('person');
              const isPlace = item.node_type?.toLowerCase().includes('place');

              return (
                <motion.div
                  key={index}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (isEvent) onSelectEvent(item);
                    else if (isPerson) onSelectPerson(item);
                  }}
                  className="bg-slate-800/30 border border-white/10 rounded-xl p-4 hover:border-amber-500/30 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isEvent && <Calendar className="w-4 h-4 text-amber-400" />}
                      {isPerson && <User className="w-4 h-4 text-blue-400" />}
                      {isPlace && <MapPin className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">
                        {item.extracted_data?.name ||
                         item.extracted_data?.event ||
                         item.extracted_data?.description ||
                         item.node_type}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {item.passage?.substring(0, 150)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
