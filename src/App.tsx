import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, User, MapPin, BookOpen, Clock } from 'lucide-react';
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
    const dataUrl = `${import.meta.env.BASE_URL || ''}/undaunted_merged_kg.json`.replace(/^\/\//, '/');
    console.log('Fetching data from:', dataUrl);

    fetch(dataUrl)
      .then(r => {
        console.log('Response status:', r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        console.log('Data length:', text.length);
        return JSON.parse(text);
      })
      .then(setData)
      .catch(err => {
        console.error('Failed to load data:', err);
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {view !== 'panorama' && (
              <button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                ← Back
              </button>
            )}
            <h1 className="text-xl font-semibold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              {view === 'panorama' && 'Undaunted: A Journey Through Chabad History'}
              {view === 'era' && selectedEra?.name}
              {view === 'event' && 'Event Details'}
              {view === 'person' && 'Person Profile'}
              {view === 'search' && 'Search'}
            </h1>
          </div>
          {view === 'panorama' && (
            <button onClick={() => setView('search')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="pt-20 h-screen">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading timeline...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-400">
              <p className="mb-2">Failed to load data</p>
              <p className="text-sm text-slate-500">{error}</p>
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

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timelineData.events.length} Events</span>
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {timelineData.people.length} People</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {timelineData.places.length} Places</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {timelineData.teachings.length} Teachings</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
