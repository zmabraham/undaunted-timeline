import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, User, MapPin, BookOpen, Clock, Crown } from 'lucide-react';
import { ERAS, processTimelineData, type UndauntedData } from './data/undaunted-data';
import TimelineView from './components/TimelineView';
import EraView from './components/EraView';
import EventDetail from './components/EventDetail';
import PersonProfile from './components/PersonProfile';
import SearchPanel from './components/SearchPanel';

type View = 'panorama' | 'era' | 'event' | 'person' | 'search';

function App() {
  const [view, setView] = useState<View>('panorama');
  const [selectedEra, setSelectedEra] = useState<typeof ERAS[number] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [data, setData] = useState<UndauntedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try the direct path first (works in most cases)
    const paths = [
      '/undaunted_merged_kg.json',
      './undaunted_merged_kg.json',
      `${window.location.origin}/undaunted_merged_kg.json`
    ];

    const tryFetch = async (index = 0) => {
      if (index >= paths.length) {
        setError('Could not load timeline data');
        setLoading(false);
        return;
      }

      const path = paths[index];
      console.log(`Trying path ${index + 1}:`, path);

      try {
        const response = await fetch(path);
        if (response.ok) {
          const text = await response.text();
          console.log('Data loaded:', text.length, 'bytes');
          const json = JSON.parse(text);
          setData(json);
          setLoading(false);
        } else {
          console.log(`Path ${index + 1} failed:`, response.status);
          tryFetch(index + 1);
        }
      } catch (err) {
        console.log(`Path ${index + 1} error:`, err);
        tryFetch(index + 1);
      }
    };

    tryFetch();
  }, []);

  const timelineData = useMemo(() => {
    if (!data) return { events: [], people: [], places: [], teachings: [], allEntities: [] };
    return processTimelineData(data);
  }, [data]);

  const handleBack = () => {
    if (view === 'event' && selectedEra) {
      setView('era');
      setSelectedEvent(null);
    } else if (view === 'era') {
      setView('panorama');
      setSelectedEra(null);
    } else if (view === 'person') {
      setView('era');
      setSelectedPerson(null);
    } else if (view === 'search') {
      setView('panorama');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-400 via-ink-500 to-ink-400 text-white overflow-hidden font-body">
      {/* Elegant Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ink-500/90 backdrop-blur-md border-b border-gold-400/20">
        {/* Decorative top border */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {view !== 'panorama' && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 font-subheading text-sm text-gold-300 hover:text-gold-200 border border-gold-400/30 rounded-full hover:bg-gold-400/10 transition-all"
                >
                  ← Return
                </button>
              )}
              <div>
                <h1 className="font-display text-xl font-semibold text-gold-200">
                  {view === 'panorama' && 'Undaunted: The Living Timeline'}
                  {view === 'era' && selectedEra?.name}
                  {view === 'event' && 'Event Chronicle'}
                  {view === 'person' && 'Soul Profile'}
                  {view === 'search' && 'Search the Archives'}
                </h1>
                {view === 'panorama' && (
                  <p className="font-body text-sm text-parchment-500 italic mt-0.5">
                    A journey through Chabad history
                  </p>
                )}
              </div>
            </div>
            {view === 'panorama' && (
              <button
                onClick={() => setView('search')}
                className="p-2.5 border border-gold-400/30 rounded-full hover:bg-gold-400/10 transition-all"
              >
                <Search className="w-5 h-5 text-gold-300" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 h-screen">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Crown className="w-12 h-12 text-gold-400 mx-auto mb-4 animate-pulse" />
              <p className="font-subheading text-parchment-400 text-lg">Loading the archives...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="font-display text-red-400 text-xl mb-2">Failed to Load</p>
              <p className="font-body text-parchment-500">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && (
          <AnimatePresence mode="wait">
          {view === 'panorama' && (
            <TimelineView
              key="panorama"
              eras={ERAS}
              events={timelineData.events}
              onSelectEra={(era) => { setSelectedEra(era); setView('era'); }}
            />
          )}
          {view === 'era' && selectedEra && (
            <EraView
              key="era"
              era={selectedEra}
              events={timelineData.events.filter((e: any) => e.year && e.year >= selectedEra.startYear && e.year <= selectedEra.endYear)}
              onSelectEvent={(evt: any) => { setSelectedEvent(evt); setView('event'); }}
              onSelectPerson={(person: any) => { setSelectedPerson(person); setView('person'); }}
            />
          )}
          {view === 'event' && selectedEvent && (
            <EventDetail
              key="event"
              event={selectedEvent}
              places={timelineData.places}
              onSelectPerson={(person: any) => { setSelectedPerson(person); setSelectedEvent(null); setView('person'); }}
            />
          )}
          {view === 'person' && selectedPerson && (
            <PersonProfile key="person" person={selectedPerson} events={timelineData.events} />
          )}
          {view === 'search' && (
            <SearchPanel
              key="search"
              entities={timelineData.allEntities}
              events={timelineData.events}
              onSelectEvent={(evt: any) => { setSelectedEvent(evt); setView('event'); }}
              onSelectPerson={(person: any) => { setSelectedPerson(person); setView('person'); }}
            />
          )}
          </AnimatePresence>
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-ink-500/90 backdrop-blur-md border-t border-gold-400/20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-8 font-subheading text-sm text-parchment-500">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-500" />
            {timelineData.events.length} Chronicles
          </span>
          <span className="text-gold-400/50">✦</span>
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-gold-500" />
            {timelineData.people.length} Souls
          </span>
          <span className="text-gold-400/50">✦</span>
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-500" />
            {timelineData.places.length} Places
          </span>
          <span className="text-gold-400/50">✦</span>
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gold-500" />
            {timelineData.teachings.length} Teachings
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
