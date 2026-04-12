import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';

interface Era {
  id: string;
  name: string;
  years: string;
  description: string;
  color: string;
}

interface EraViewProps {
  era: Era;
  events: any[];
  onSelectEvent: (event: any) => void;
  onSelectPerson: (person: any) => void;
}

export default function EraView({ era, events, onSelectEvent, onSelectPerson }: EraViewProps) {
  const getEraPeople = () => {
    const mentioned = new Set<string>();
    events.forEach(evt => {
      const passage = evt.passage || '';
      const matches = passage.match(/(Rabbi [A-Z][a-z]+|Rebbe|The [A-Z][a-z]+)/g);
      matches?.forEach((m: string) => mentioned.add(m));
    });
    return Array.from(mentioned).slice(0, 12);
  };

  const eraPeople = getEraPeople();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${era.color}20`, color: era.color }}
          >
            {era.years}
          </div>
          <h2 className="text-4xl font-bold mb-4">{era.name}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">{era.description}</p>
        </motion.div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Key Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.slice(0, 18).map((event: any, index: number) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => onSelectEvent(event)}
                className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 cursor-pointer hover:border-amber-500/30 transition-all"
              >
                {event.year && (
                  <div className="text-sm font-semibold mb-2" style={{ color: era.color }}>
                    {event.year}
                  </div>
                )}
                <h4 className="font-medium mb-2 line-clamp-2">
                  {event.extracted_data?.event || event.extracted_data?.description || 'Event'}
                </h4>
                <p className="text-sm text-slate-400 line-clamp-3">
                  {event.passage?.substring(0, 150)}...
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {eraPeople.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              People of This Era
            </h3>
            <div className="flex flex-wrap gap-2">
              {eraPeople.map((person: string, index: number) => (
                <motion.button
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onSelectPerson({ extracted_data: { name: person }, passage: '' })}
                  className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full text-sm hover:border-amber-500/30 transition-all"
                >
                  {person}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
