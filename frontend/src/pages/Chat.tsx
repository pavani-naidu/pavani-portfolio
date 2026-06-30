import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Search,
  Pin,
  Trash2,
  Send,
  Mic,
  Volume2,
  Copy,
  Download,
  Edit2,
  RefreshCw,
  Plus,
  Smile,
  Check,
  User,
  Heart,
  ThumbsUp,
  Award
} from 'lucide-react';
import api from '../services/api';

export const Chat: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInputText((prev) => prev + ' ' + text);
        setIsRecording(false);
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data);
      if (res.data.length > 0 && !activeChatId) {
        setActiveChatId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const res = await api.post('/chats', { title: 'New Conversation' });
      setChats([res.data, ...chats]);
      setActiveChatId(res.data._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeChatId) return;

    setInputText('');
    setLoading(true);

    // Optimistically update message
    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/chats/${activeChatId}/messages`, { text });
      
      // Update actual messages list
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempUserMsg._id).concat([res.data.userMessage, res.data.aiMessage])
      );

      // Refresh chat list to update title if it changed
      fetchChats();
      refreshUser();
    } catch (err) {
      console.error(err);
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setLoading(false);
    }
  };

  const handlePinChat = async (id: string, isPinned: boolean) => {
    try {
      const endpoint = isPinned ? 'unpin' : 'pin';
      await api.put(`/chats/${id}/${endpoint}`);
      fetchChats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await api.delete(`/chats/${id}`);
      const filtered = chats.filter((c) => c._id !== id);
      setChats(filtered);
      if (activeChatId === id) {
        setActiveChatId(filtered.length > 0 ? filtered[0]._id : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await api.put(`/chats/messages/${messageId}/react`, { emoji });
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === messageId) {
            const reactions = m.reactions.filter((r: any) => r.user !== user?.id);
            reactions.push({ user: user?.id, emoji });
            return { ...m, reactions };
          }
          return m;
        })
      );
      setActiveReactionMessageId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech is not supported in this browser.');
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice Recognition is not supported or permission denied.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleExport = async (format: 'json' | 'text') => {
    if (!activeChatId) return;
    window.open(`http://localhost:5000/api/chats/${activeChatId}/export?format=${format}`);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] overflow-hidden gap-4">
      {/* Chats Sidebar */}
      <div className="w-80 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-4">
          <button
            onClick={handleCreateChat}
            className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Conversation
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Chat entries */}
          <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredChats.map((c) => (
              <div
                key={c._id}
                onClick={() => setActiveChatId(c._id)}
                className={`
                  p-3 rounded-xl flex items-center justify-between cursor-pointer group transition-all
                  ${c._id === activeChatId ? 'bg-white/5 border-l-2 border-brand-primary' : 'hover:bg-white/5'}
                `}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <Sparkles className={`w-4 h-4 shrink-0 ${c._id === activeChatId ? 'text-brand-primary' : 'text-slate-500'}`} />
                  <span className="text-xs truncate font-medium text-slate-200">{c.title}</span>
                </div>
                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinChat(c._id, c.isPinned);
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <Pin className={`w-3.5 h-3.5 ${c.isPinned ? 'fill-white text-white' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(c._id);
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data export controls */}
        {activeChatId && (
          <div className="flex gap-2 border-t border-white/5 pt-3.5">
            <button
              onClick={() => handleExport('text')}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" /> TXT Export
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" /> JSON Export
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Panel */}
      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden">
        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
              <Sparkles className="w-10 h-10 text-brand-primary mb-4 animate-bounce" />
              <h3 className="font-extrabold text-lg">Yuvi Mantra Companion AI</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                "Hello! I am your companion. I am here to help you unpack study stress, organize assignments, or just chat. Remember, I am an AI friend and not a therapist."
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6 w-full text-left">
                {[
                  "I'm feeling really stressed about exams.",
                  "Help me schedule my study breaks.",
                  "Give me a daily wellness quote.",
                  "Let's practice a meditation technique."
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-[10px] font-medium text-slate-300 text-left transition-all hover:-translate-y-0.5"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m._id}
                  className={`flex gap-3 max-w-3xl ${isAi ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-md ${
                    isAi ? 'bg-gradient-to-tr from-brand-primary to-brand-secondary' : 'bg-white/10'
                  }`}>
                    {isAi ? <Sparkles className="w-4.5 h-4.5" /> : (user?.name[0] || 'U')}
                  </div>

                  {/* Bubble Container */}
                  <div className="space-y-1.5 relative group">
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isAi ? 'bg-white/5 border border-white/5 text-slate-200' : 'bg-brand-primary text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Display Suggested quick-replies (only on the last AI message) */}
                      {isAi && m.suggestions && m.suggestions.length > 0 && m._id === messages[messages.length - 1]._id && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {m.suggestions.map((s: string) => (
                            <button
                              key={s}
                              onClick={() => handleSendMessage(s)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold rounded-lg text-white transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions display */}
                    {m.reactions && m.reactions.length > 0 && (
                      <div className="flex gap-1 absolute bottom-[-10px] left-3">
                        {m.reactions.map((r: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded-full"
                          >
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Controls popup overlay on hover */}
                    <div className={`
                      flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2
                      ${isAi ? 'right-[-85px]' : 'left-[-85px]'}
                    `}>
                      {isAi && (
                        <button
                          onClick={() => handleTextToSpeech(m.text)}
                          className="p-1.5 bg-slate-950 border border-white/5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                          title="Speak Text"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyText(m.text)}
                        className="p-1.5 bg-slate-950 border border-white/5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveReactionMessageId(activeReactionMessageId === m._id ? null : m._id)}
                        className="p-1.5 bg-slate-950 border border-white/5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                        title="React"
                      >
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reaction Selection overlay */}
                    {activeReactionMessageId === m._id && (
                      <div className={`
                        absolute z-50 bg-slate-950 border border-white/10 p-1.5 rounded-xl shadow-2xl flex gap-1.5
                        ${isAi ? 'right-0 top-[110%]' : 'left-0 top-[110%]' }
                      `}>
                        {['❤️', '👍', '🧘', '😢', '😊'].map((emo) => (
                          <button
                            key={emo}
                            onClick={() => handleReaction(m._id, emo)}
                            className="hover:scale-125 transition-transform text-sm p-1"
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {loading && (
            <div className="flex gap-3 max-w-lg self-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-4.5 h-4.5 animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-slate-400 text-xs italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                Yuvi Mantra is reflecting...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        {activeChatId ? (
          <div className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center gap-3">
            <button
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-red-500 border-transparent text-white animate-pulse'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Voice Dictation"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              placeholder={isRecording ? 'Listening...' : 'Type a message to Yuvi Mantra...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isRecording}
              className="flex-1 px-4 py-3 bg-slate-950/80 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-brand-primary text-slate-200"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="p-3 bg-brand-primary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send className="w-5 h-5 fill-white" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-white/5 bg-slate-950/40 text-center text-xs text-slate-500">
            Select a conversation session to begin chatting.
          </div>
        )}
      </div>
    </div>
  );
};
