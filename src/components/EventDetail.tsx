import { motion } from 'framer-motion';
import { MapPin, Calendar, User, ArrowRight } from 'lucide-react';

interface EventDetailProps {
  event: any;
  places: any[];
  onSelectPerson: (person: any) => void;
}

export default function EventDetail({ event, onSelectPerson }: EventDetailProps) {
  const extractPeople = () => {
    const passage = event.passage || '';
    const matches = passage.match(/(Rabbi [A-Z][a-z]+|Rebbe|The [A-Z][a-z]+)/g);
    return matches ? [...new Set(matches)] : [];
  };

  const mentionedPeople = extractPeople();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-y-auto px-8 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 mb-8"
        >
          {event.year && (
            <div className="flex items-center gap-2 text-amber-400 mb-4">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">{event.year}</span>
            </div>
          )}
          <h2 className="text-3xl font-bold mb-4">
            {event.extracted_data?.event || event.extracted_data?.description || 'Historical Event'}
          </h2>
          {event.extracted_data?.location && (
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4" />
              <span>{event.extracted_data.location}</span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 border border-white/10 rounded-xl p-6 mb-8"
        >
          <p className="text-lg leading-relaxed text-slate-200">
            {event.passage}
          </p>
        </motion.div>

        {mentionedPeople.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/30 border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              People Mentioned
            </h3>
            <div className="flex flex-wrap gap-2">
              {mentionedPeople.map((person, index: number) => (
                <button
                  key={index}
                  onClick={() => onSelectPerson({ extracted_data: { name: person as string }, passage: '' })}
                  className="group flex items-center gap-2 px-4 py-2 bg-slate-700/50 border border-white/10 rounded-full hover:border-amber-500/30 transition-all"
                >
                  <span>{person as string}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {Object.entries(event.extracted_data || {}).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Object.entries(event.extracted_data)
              .filter(([key]) => !['event', 'description', 'location', 'date', 'year'].includes(key))
              .slice(0, 4)
              .map(([key, value]: [string, any]) => (
                <div key={key} className="bg-slate-800/30 border border-white/10 rounded-lg p-4">
                  <div className="text-xs text-slate-500 uppercase mb-1">{key}</div>
                  <div className="text-slate-200">{String(value ?? '')}</div>
                </div>
              ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
