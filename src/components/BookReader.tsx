import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, List, Search, X, Crown } from 'lucide-react';

interface Chapter {
  number: number;
  title: string;
  content: string;
  paragraphs: string[];
  word_count: number;
}

interface BookData {
  title: string;
  chapters: Chapter[];
}

interface BookReaderProps {
  initialChapter?: number;
  highlightText?: string;
  onBack?: () => void;
}

export default function BookReader({ initialChapter = 1, highlightText, onBack }: BookReaderProps) {
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [loading, setLoading] = useState(true);
  const [showTOC, setShowTOC] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ chapter: number; paragraph: number; text: string }>>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load book data
  useEffect(() => {
    fetch('/data/book.json')
      .then(res => res.json())
      .then(data => {
        setBookData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load book:', err);
        setLoading(false);
      });
  }, []);

  // Scroll to highlighted text
  useEffect(() => {
    if (highlightText && contentRef.current) {
      const content = contentRef.current.textContent || '';
      const index = content.toLowerCase().indexOf(highlightText.toLowerCase());
      if (index !== -1) {
        // Find the element containing the text and scroll to it
        const walker = document.createTreeWalker(
          contentRef.current,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node;
        while (node = walker.nextNode()) {
          if (node.textContent && node.textContent.toLowerCase().includes(highlightText.toLowerCase())) {
            const parent = node.parentElement;
            if (parent) {
              parent.scrollIntoView({ behavior: 'smooth', block: 'center' });
              parent.classList.add('bg-gold-400/30');
              setTimeout(() => parent.classList.remove('bg-gold-400/30'), 3000);
              break;
            }
          }
        }
      }
    }
  }, [currentChapter, highlightText, bookData]);

  const currentChapterData = bookData?.chapters[currentChapter - 1];

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim() || !bookData) return;

    const results: Array<{ chapter: number; paragraph: number; text: string }> = [];
    const query = searchQuery.toLowerCase();

    bookData.chapters.forEach(chapter => {
      chapter.paragraphs.forEach((paragraph, pIndex) => {
        if (paragraph.toLowerCase().includes(query)) {
          results.push({
            chapter: chapter.number,
            paragraph: pIndex,
            text: paragraph.substring(0, 200) + (paragraph.length > 200 ? '...' : '')
          });
        }
      });
    });

    setSearchResults(results);
  };

  const goToResult = (chapter: number, paragraph: number) => {
    setCurrentChapter(chapter);
    setShowTOC(false);
    setSearchResults([]);

    setTimeout(() => {
      const paragraphs = contentRef.current?.querySelectorAll('p');
      if (paragraphs && paragraphs[paragraph]) {
        paragraphs[paragraph].scrollIntoView({ behavior: 'smooth', block: 'center' });
        (paragraphs[paragraph] as HTMLElement).classList.add('bg-gold-400/30');
        setTimeout(() => (paragraphs[paragraph] as HTMLElement).classList.remove('bg-gold-400/30'), 3000);
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-ink-500">
        <div className="text-center">
          <Crown className="w-12 h-12 text-gold-400 mx-auto mb-4 animate-pulse" />
          <p className="font-subheading text-parchment-400">Loading the chronicles...</p>
        </div>
      </div>
    );
  }

  if (!bookData || !currentChapterData) {
    return (
      <div className="h-full flex items-center justify-center bg-ink-500">
        <p className="font-body text-parchment-400">Unable to load book content</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-ink-500 relative">
      {/* Aged paper texture overlay */}
      <div className="fixed inset-0 bg-aged-paper opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 bg-ink-500/90 backdrop-blur-sm border-b border-gold-400/20 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 border border-gold-400/30 rounded-full hover:bg-gold-400/10 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gold-300" />
              </button>
            )}
            <div>
              <h1 className="font-display text-lg sm:text-xl text-gold-200">Undaunted</h1>
              <p className="font-subheading text-xs text-parchment-500">The Complete Chronicles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="p-2 border border-gold-400/30 rounded-full hover:bg-gold-400/10 transition-all"
              title="Table of Contents"
            >
              <List className="w-4 h-4 text-gold-300" />
            </button>
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentChapter(Math.max(1, currentChapter - 1))}
            disabled={currentChapter === 1}
            className="flex items-center gap-2 px-4 py-2 bg-parchment-100/80 border border-gold-400/30 rounded-full hover:bg-parchment-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-subheading text-sm text-ink-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="text-center">
            <h2 className="font-display text-base sm:text-lg text-gold-200">{currentChapterData.title}</h2>
            <p className="font-subheading text-xs text-parchment-500">
              Chapter {currentChapter} of {bookData.chapters.length}
            </p>
          </div>

          <button
            onClick={() => setCurrentChapter(Math.min(bookData.chapters.length, currentChapter + 1))}
            disabled={currentChapter === bookData.chapters.length}
            className="flex items-center gap-2 px-4 py-2 bg-parchment-100/80 border border-gold-400/30 rounded-full hover:bg-parchment-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-subheading text-sm text-ink-200"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content */}
        <motion.div
          key={currentChapter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative z-10"
        >
          <div
            ref={contentRef}
            className="max-w-3xl mx-auto bg-parchment-100/95 backdrop-blur-sm border border-gold-400/30 rounded-lg p-6 sm:p-10 shadow-ornate"
          >
            {/* Chapter header */}
            <div className="text-center mb-8 pb-6 border-b border-gold-400/20">
              <BookOpen className="w-10 h-10 text-gold-500 mx-auto mb-4" />
              <h3 className="font-display text-2xl sm:text-3xl text-ink-200 mb-2">{currentChapterData.title}</h3>
              <p className="font-subheading text-sm text-parchment-600">
                {currentChapterData.word_count.toLocaleString()} words
              </p>
            </div>

            {/* Chapter content */}
            <div className="prose prose-parchment max-w-none">
              {currentChapterData.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-body text-base sm:text-lg leading-relaxed text-ink-100 mb-6"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Chapter end navigation */}
            <div className="mt-12 pt-8 border-t border-gold-400/20 flex justify-center gap-4">
              {currentChapter > 1 && (
                <button
                  onClick={() => setCurrentChapter(currentChapter - 1)}
                  className="px-6 py-3 bg-parchment-200/50 border border-gold-400/30 rounded-full font-subheading text-sm text-ink-200 hover:bg-parchment-300 transition-all"
                >
                  ← Previous Chapter
                </button>
              )}
              {currentChapter < bookData.chapters.length && (
                <button
                  onClick={() => setCurrentChapter(currentChapter + 1)}
                  className="px-6 py-3 bg-parchment-200/50 border border-gold-400/30 rounded-full font-subheading text-sm text-ink-200 hover:bg-parchment-300 transition-all"
                >
                  Next Chapter →
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Table of Contents sidebar */}
        {showTOC && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-72 bg-ink-500/95 backdrop-blur-sm border-l border-gold-400/20 p-4 overflow-y-auto relative z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-gold-200">Chapters</h3>
              <button
                onClick={() => setShowTOC(false)}
                className="p-1 hover:bg-gold-400/20 rounded-full"
              >
                <X className="w-4 h-4 text-gold-300" />
              </button>
            </div>

            <div className="space-y-2">
              {bookData.chapters.map((chapter) => (
                <button
                  key={chapter.number}
                  onClick={() => { setCurrentChapter(chapter.number); setShowTOC(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    currentChapter === chapter.number
                      ? 'bg-gold-500 text-ink-200 shadow-gold-glow'
                      : 'bg-parchment-100/50 text-ink-200 hover:bg-parchment-200'
                  }`}
                >
                  <div className="font-subheading text-sm mb-1">Chapter {chapter.number}</div>
                  <div className="font-display text-base">{chapter.title}</div>
                  <div className="font-body text-xs opacity-70 mt-1">
                    {chapter.word_count.toLocaleString()} words
                  </div>
                </button>
              ))}
            </div>

            {/* Search in TOC */}
            <div className="mt-6 pt-4 border-t border-gold-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-gold-500" />
                <span className="font-subheading text-sm text-gold-200">Search</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search the book..."
                  className="w-full px-3 py-2 pl-9 bg-parchment-100/80 border border-gold-400/30 rounded-lg text-sm text-ink-200 placeholder-parchment-500 focus:outline-none focus:border-gold-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gold-500" />
              </div>
              <button
                onClick={handleSearch}
                className="w-full mt-2 px-4 py-2 bg-gold-400/20 border border-gold-400/30 rounded-lg font-subheading text-sm text-gold-200 hover:bg-gold-400/30 transition-all"
              >
                Search
              </button>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mt-3 max-h-60 overflow-y-auto">
                  <p className="font-subheading text-xs text-parchment-500 mb-2">
                    Found {searchResults.length} results
                  </p>
                  <div className="space-y-2">
                    {searchResults.slice(0, 20).map((result, index) => (
                      <button
                        key={index}
                        onClick={() => goToResult(result.chapter, result.paragraph)}
                        className="block w-full text-left px-3 py-2 bg-parchment-100/50 rounded hover:bg-parchment-200 transition-all"
                      >
                        <div className="font-subheading text-xs text-gold-700">
                          Chapter {result.chapter}, Paragraph {result.paragraph + 1}
                        </div>
                        <div className="font-body text-xs text-ink-100 line-clamp-2">
                          {result.text}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
