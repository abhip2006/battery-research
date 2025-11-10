import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import { useChat } from '../hooks/useChat';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    submitFeedback,
  } = useChat({ autoLoadHistory: true, top_k: 5 });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const query = inputMessage;
    setInputMessage('');

    try {
      await sendMessage(query);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      await clearConversation();
    }
  };

  return (
    <>
      {/* Floating Button - Responsive sizing and positioning */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 p-3 sm:p-4 rounded-full bg-[#B2FF59] shadow-lg shadow-[#B2FF59]/20 hover:shadow-[#B2FF59]/40 transition-shadow duration-300 touch-manipulation"
        style={{
          // iOS safe area support
          bottom: 'calc(1rem + env(safe-area-inset-bottom))',
          right: 'calc(1rem + env(safe-area-inset-right))',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="size-6 sm:size-6 text-[#1E1E1E]" />
        ) : (
          <MessageCircle className="size-6 sm:size-6 text-[#1E1E1E]" />
        )}
      </motion.button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
          />
        )}
      </AnimatePresence>

      {/* Chat Window - Responsive with drawer on mobile, floating on desktop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
              // Mobile: slide from bottom
              ...(window.innerWidth < 640 && { y: '100%', scale: 1 })
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.95,
              // Mobile: slide to bottom
              ...(window.innerWidth < 640 && { y: '100%', scale: 1 })
            }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className="fixed z-40
              /* Mobile: Full screen drawer from bottom */
              bottom-0 left-0 right-0
              max-h-[85vh]
              rounded-t-2xl
              /* Desktop: Floating window */
              sm:bottom-24 sm:right-8 sm:left-auto
              sm:w-96 sm:max-h-[600px] sm:h-[600px]
              sm:rounded-2xl
              bg-[#303030] shadow-2xl border border-[#B2FF59]/20 flex flex-col"
            style={{
              // iOS safe area support
              paddingBottom: 'env(safe-area-inset-bottom)',
              maxHeight: 'calc(85vh - env(safe-area-inset-top))',
            }}
          >
            {/* Header */}
            <div className="p-4 sm:p-4 border-b border-[#B2FF59]/20 flex items-center justify-between shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-[#FAFAFA] font-bold text-base sm:text-lg truncate">
                  Battery Intelligence Assistant
                </h3>
                <p className="text-[#FAFAFA]/60 text-xs sm:text-sm">
                  Powered by RAG & Claude
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-2.5 sm:p-2 hover:bg-[#1E1E1E] rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Clear conversation"
                    aria-label="Clear conversation"
                  >
                    <Trash2 className="size-5 sm:size-4 text-[#FAFAFA]/60 hover:text-[#B2FF59]" />
                  </button>
                )}
                {/* Close button on mobile */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 sm:hidden hover:bg-[#1E1E1E] rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <X className="size-5 text-[#FAFAFA]/60 hover:text-[#B2FF59]" />
                </button>
              </div>
            </div>

            {/* Chat Area - Scrollable */}
            <div className="flex-1 p-4 overflow-y-auto overscroll-contain">
              <div className="space-y-4 pb-2">
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1E1E1E] p-4 rounded-lg"
                  >
                    <p className="text-[#FAFAFA]/80 text-sm mb-3">
                      Hello! I can help you explore data about the U.S. battery industry. Try asking:
                    </p>
                    <ul className="space-y-2 text-[#B2FF59] text-sm">
                      <li
                        className="cursor-pointer hover:text-[#A0E050] touch-manipulation py-1"
                        onClick={() => setInputMessage('Who are the top solid-state battery companies?')}
                      >
                        • Top solid-state battery companies
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#A0E050] touch-manipulation py-1"
                        onClick={() => setInputMessage('Which firms have the highest DOE funding exposure?')}
                      >
                        • DOE funding exposure by firm
                      </li>
                      <li
                        className="cursor-pointer hover:text-[#A0E050] touch-manipulation py-1"
                        onClick={() => setInputMessage('What are 2030 battery capacity projections?')}
                      >
                        • 2030 battery capacity projections
                      </li>
                    </ul>
                  </motion.div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 sm:p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-[#B2FF59]/20 text-[#FAFAFA] ml-4 sm:ml-8'
                        : 'bg-[#1E1E1E] text-[#FAFAFA]/90 mr-4 sm:mr-8'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>

                    {/* Citations */}
                    {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#B2FF59]/20">
                        <p className="text-xs text-[#B2FF59] mb-2">Sources:</p>
                        <div className="space-y-1">
                          {msg.citations.map((citation, citIdx) => (
                            <div key={citIdx} className="text-xs text-[#FAFAFA]/60 break-words">
                              [{citation.citation_id}] {citation.source_document}
                              {citation.section_title && ` - ${citation.section_title}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence Score */}
                    {msg.role === 'assistant' && msg.confidence_score && (
                      <div className="mt-2 text-xs text-[#FAFAFA]/50">
                        Confidence: {(msg.confidence_score * 100).toFixed(0)}%
                      </div>
                    )}

                    {/* Feedback Buttons */}
                    {msg.role === 'assistant' && msg.id && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => submitFeedback(msg.id, 5, 'helpful')}
                          className="text-[#FAFAFA]/40 hover:text-[#B2FF59] transition-colors touch-manipulation p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:p-0 flex items-center justify-center"
                          title="Helpful"
                          aria-label="Mark as helpful"
                        >
                          <ThumbsUp className="size-4 sm:size-3" />
                        </button>
                        <button
                          onClick={() => submitFeedback(msg.id, 1, 'unhelpful')}
                          className="text-[#FAFAFA]/40 hover:text-red-500 transition-colors touch-manipulation p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:p-0 flex items-center justify-center"
                          title="Not helpful"
                          aria-label="Mark as not helpful"
                        >
                          <ThumbsDown className="size-4 sm:size-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[#B2FF59] text-sm"
                  >
                    <Loader2 className="size-4 animate-spin" />
                    <span>Thinking...</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="p-4 border-t border-[#B2FF59]/20 shrink-0 bg-[#303030]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  placeholder="Ask anything about the U.S. battery industry..."
                  className="flex-1 bg-[#1E1E1E] text-[#FAFAFA] px-4 py-3 sm:py-2 rounded-lg border-2 border-transparent focus:border-[#B2FF59] outline-none transition-all duration-300 disabled:opacity-50 text-base sm:text-sm min-h-[44px]"
                  style={{
                    fontSize: '16px', // Prevents iOS zoom on focus
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 sm:px-3 py-3 sm:py-2 bg-[#B2FF59] rounded-lg hover:bg-[#A0E050] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="size-5 text-[#1E1E1E] animate-spin" />
                  ) : (
                    <Send className="size-5 text-[#1E1E1E]" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
