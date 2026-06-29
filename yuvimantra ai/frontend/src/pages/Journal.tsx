import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  Search,
  Tag,
  Star,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  Save,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import api from '../services/api';

export const Journal: React.FC = () => {
  const { refreshUser } = useAuth();
  
  const [journals, setJournals] = useState<any[]>([]);
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('😊');

  const [saving, setSaving] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchJournals();
  }, [searchQuery, selectedTag]);

  const fetchJournals = async () => {
    try {
      let url = '/journals';
      const params: string[] = [];
      if (searchQuery) params.push(`search=${searchQuery}`);
      if (selectedTag) params.push(`tag=${selectedTag}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setJournals(res.data);
      
      // Compile tags
      const tagsSet = new Set<string>();
      res.data.forEach((j: any) => {
        if (j.tags) j.tags.forEach((t: string) => tagsSet.add(t));
      });
      setAllTags(Array.from(tagsSet));

      if (res.data.length > 0 && !activeJournalId) {
        handleSelectJournal(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectJournal = (j: any) => {
    setActiveJournalId(j._id);
    setTitle(j.title);
    setContent(j.content);
    setTagsInput(j.tags ? j.tags.join(', ') : '');
    setMoodEmoji(j.moodEmoji || '😊');
  };

  const handleCreateNew = () => {
    setActiveJournalId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setMoodEmoji('😊');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = { title, content, tags, moodEmoji };

      if (activeJournalId) {
        // Update
        const res = await api.put(`/journals/${activeJournalId}`, payload);
        // Update local list
        setJournals((prev) => prev.map((j) => (j._id === activeJournalId ? res.data : j)));
      } else {
        // Create
        const res = await api.post('/journals', payload);
        setJournals([res.data, ...journals]);
        setActiveJournalId(res.data._id);
      }

      fetchJournals();
      refreshUser();
      alert('Journal saved successfully! AI analysis generated.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await api.delete(`/journals/${id}`);
      const filtered = journals.filter((j) => j._id !== id);
      setJournals(filtered);
      if (activeJournalId === id) {
        if (filtered.length > 0) handleSelectJournal(filtered[0]);
        else handleCreateNew();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await api.put(`/journals/${id}/favorite`);
      setJournals((prev) => prev.map((j) => (j._id === id ? res.data : j)));
    } catch (err) {
      console.error(err);
    }
  };

  const activeJournal = journals.find((j) => j._id === activeJournalId);

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] overflow-hidden gap-4">
      {/* Journals Sidebar List */}
      <div className="w-80 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shrink-0 hidden md:flex">
        <button
          onClick={handleCreateNew}
          className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Journal Entry
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search journals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Tags filters */}
        {allTags.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Filter by Tag</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  !selectedTag ? 'bg-brand-primary text-white border-transparent' : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    selectedTag === tag ? 'bg-brand-primary text-white border-transparent' : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Entry List */}
        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
          {journals.map((j) => (
            <div
              key={j._id}
              onClick={() => handleSelectJournal(j)}
              className={`
                p-3 rounded-xl flex flex-col gap-1 cursor-pointer transition-all border
                ${j._id === activeJournalId ? 'bg-white/5 border-brand-primary' : 'bg-transparent border-transparent hover:bg-white/5'}
              `}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs truncate font-bold text-slate-200 mr-2">{j.title}</span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {new Date(j.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate leading-relaxed">{j.content}</p>
              <div className="flex justify-between items-center mt-1.5">
                <div className="flex gap-1">
                  {j.tags && j.tags.slice(0, 2).map((t: string) => (
                    <span key={t} className="text-[8px] bg-slate-900 border border-white/10 px-1 py-0.2 rounded text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
                {j.isFavorite && <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor & AI Diagnostics panel */}
      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Editor Main body */}
        <div className="flex-1 flex flex-col justify-between p-4 md:p-6 border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto">
          <div className="space-y-4">
            {/* Header controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-primary" />
                <span className="text-sm font-bold text-slate-200">
                  {activeJournalId ? 'Edit Entry' : 'New Reflection'}
                </span>
              </div>
              {activeJournalId && (
                <button
                  onClick={() => handleDelete(activeJournalId)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inputs */}
            <input
              type="text"
              placeholder="Journal Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-lg md:text-xl font-bold tracking-tight text-white focus:outline-none border-b border-white/5 pb-2"
            />

            {/* Rich text area */}
            <textarea
              placeholder="Type your feelings, reflections, or notes here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-sm leading-relaxed text-slate-200 focus:outline-none h-64 resize-none pr-1"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
              {/* Emoji selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">Mood:</span>
                <select
                  value={moodEmoji}
                  onChange={(e) => setMoodEmoji(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-xl px-2 py-1 text-sm text-slate-300"
                >
                  {['😊', '🧘', '⚡', '😴', '😰', '😢'].map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags inline input */}
              <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                <span className="text-xs text-slate-400">Tags:</span>
                <input
                  type="text"
                  placeholder="happy, study"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="bg-slate-950 border border-white/5 rounded-xl px-2 py-1 text-xs text-slate-300 w-full"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-xl hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Journal
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Diagnostics Right Sidebar */}
        <div className="w-full md:w-72 p-4 md:p-6 bg-slate-950/20 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <BrainCircuit className="w-5 h-5 text-brand-primary animate-pulse" />
            <h4 className="font-extrabold text-sm text-white">AI Mindful Insights</h4>
          </div>

          {activeJournal && activeJournal.aiSummary ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AI Entry Summary</span>
                <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-xs text-slate-300 leading-relaxed italic">
                  "{activeJournal.aiSummary}"
                </div>
              </div>

              {/* Sentiment badge */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sentiment Score</span>
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 rounded-2xl">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    activeJournal.sentiment === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'
                      : activeJournal.sentiment === 'negative'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/10'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/10'
                  }`}>
                    {activeJournal.sentiment.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-300">
                    Score: {activeJournal.sentimentScore.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Toggle favorite */}
              <button
                onClick={() => handleToggleFavorite(activeJournal._id)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-300 border border-white/5 transition-all flex items-center justify-center gap-1.5"
              >
                <Star className={`w-4 h-4 ${activeJournal.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
                {activeJournal.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs leading-relaxed">
              No analysis available yet. Fill in details and click "Save Journal" to trigger AI diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
