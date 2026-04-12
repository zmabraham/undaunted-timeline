import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Era {
  id: string;
  name: string;
  years: string;
  startYear: number;
  endYear: number;
  color: string;
  description: string;
}

interface Event {
  year: number | null;
  extracted_data: { description?: string; event?: string };
}

interface TimelineViewProps {
  eras: Era[];
  events: Event[];
  onSelectEra: (era: Era) => void;
}

export default function TimelineView({ eras, events, onSelectEra }: TimelineViewProps) {

  // Count events per era for density indicator
  const getEventCount = (era: Era) => {
    return events.filter(e => e.year && e.year >= era.startYear && e.year <= era.endYear).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center px-8"
    >
      {/* Hero Title */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
          The Living Timeline
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Explore the journey of Chabad Lubavitch through five defining eras.
          Click any era to discover the people, places, and events that shaped history.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative w-full max-w-6xl">
        {/* Timeline Base Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 via-amber-600 to-slate-700 rounded-full transform -translate-y-1/2" />

        {/* Era Cards */}
        <div className="flex justify-between items-center relative">
          {eras.map((era, index) => {
            const eventCount = getEventCount(era);

            return (
              <motion.div
                key={era.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => onSelectEra(era)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-slate-800/50 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 w-64 hover:border-amber-500 transition-all"
                    style={{
                      boxShadow: `0 0 30px ${era.color}20`
                    }}
                  >
                    {/* Era Indicator Line */}
                    <div
                      className="absolute -top-8 left-1/2 w-0.5 h-8"
                      style={{ backgroundColor: era.color }}
                    />
                    <div
                      className="absolute -top-10 left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2 animate-pulse"
                      style={{ backgroundColor: era.color, boxShadow: `0 0 20px ${era.color}` }}
                    />

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-1" style={{ color: era.color }}>
                      {era.name}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">{era.years}</p>
                    <p className="text-slate-300 text-sm leading-relaxed mb-4">{era.description}</p>

                    {/* Event Density Indicator */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(eventCount * 5, 100)}%`,
                            backgroundColor: era.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{eventCount} events</span>
                    </div>

                    {/* Click hint */}
                    <div className="flex items-center justify-between text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Click to explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-slate-500 text-sm"
      >
        Click on any era to explore • Use search to find specific people or events
      </motion.p>
    </motion.div>
  );
}
