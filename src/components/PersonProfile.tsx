import { motion } from 'framer-motion';
import { User, Calendar, BookOpen } from 'lucide-react';

interface PersonProfileProps {
  person: any;
  events: any[];
}

export default function PersonProfile({ person, events }: PersonProfileProps) {
  const name = person.extracted_data?.name || person.passage || 'Unknown';

  const personEvents = events.filter((e: any) => {
    const passage = (e.passage || '').toLowerCase();
    const nameParts = name.toLowerCase().split(' ');
    return nameParts.some((part: string) => part.length > 3 && passage.includes(part));
  });

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
          className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 mb-8 text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <User className="w-12 h-12 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{name}</h1>
          {person.extracted_data?.title && (
            <p className="text-amber-400">{person.extracted_data.title}</p>
          )}
          {person.extracted_data?.role && (
            <p className="text-slate-400 mt-2">{person.extracted_data.role}</p>
          )}
          {person.extracted_data?.years && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>{person.extracted_data.years}</span>
            </div>
          )}
        </motion.div>

        {personEvents.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              Events Involving {name}
            </h2>
            <div className="space-y-4">
              {personEvents.slice(0, 10).map((evt: any, index: number) => (
                <div
                  key={index}
                  className="bg-slate-800/30 border border-white/10 rounded-xl p-4 hover:border-amber-500/20 transition-all"
                >
                  {evt.year && (
                    <div className="text-sm text-amber-400 mb-2">{evt.year}</div>
                  )}
                  <h3 className="font-medium mb-2">
                    {evt.extracted_data?.event || evt.extracted_data?.description || 'Event'}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {evt.passage?.substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {Object.entries(person.extracted_data || {}).length > 1 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-slate-800/30 border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(person.extracted_data)
                .filter(([key]) => !['name', 'title', 'role', 'years'].includes(key))
                .slice(0, 6)
                .map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <dt className="text-xs text-slate-500 uppercase">{key}</dt>
                    <dd className="text-slate-200">{String(value ?? '')}</dd>
                  </div>
                ))}
            </dl>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
