import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#B2FF59] shadow-lg shadow-[#B2FF59]/20 hover:shadow-[#B2FF59]/40 transition-shadow duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="size-6 text-[#1E1E1E]" />
        ) : (
          <MessageCircle className="size-6 text-[#1E1E1E]" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-8 z-40 w-96 h-[500px] bg-[#303030] rounded-2xl shadow-2xl border border-[#B2FF59]/20 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#B2FF59]/20">
              <h3 className="text-[#FAFAFA]">Battery Intelligence Assistant</h3>
              <p className="text-[#FAFAFA]/60 text-sm">Ask anything about the U.S. battery industry</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1E1E1E] p-3 rounded-lg"
                >
                  <p className="text-[#FAFAFA]/80 text-sm">
                    Hello! I can help you explore data about the U.S. battery industry. Try asking:
                  </p>
                  <ul className="mt-2 space-y-1 text-[#B2FF59] text-sm">
                    <li>• Top solid-state battery companies</li>
                    <li>• DOE funding exposure by firm</li>
                    <li>• 2030 battery capacity projections</li>
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#B2FF59]/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about the U.S. battery industry..."
                  className="flex-1 bg-[#1E1E1E] text-[#FAFAFA] px-4 py-2 rounded-lg border-2 border-transparent focus:border-[#B2FF59] outline-none transition-all duration-300"
                />
                <button className="p-2 bg-[#B2FF59] rounded-lg hover:bg-[#A0E050] transition-colors duration-300">
                  <Send className="size-5 text-[#1E1E1E]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
