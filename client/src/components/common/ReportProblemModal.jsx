import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bug, Lightbulb, MessageSquare, HelpCircle, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TYPES = [
  { key: 'bug',        icon: Bug,          color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-500/10' },
  { key: 'suggestion', icon: Lightbulb,    color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  { key: 'complaint',  icon: MessageSquare,color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { key: 'other',      icon: HelpCircle,   color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-white/10' },
];

export default function ReportProblemModal({ open, onClose }) {
  const { t } = useTranslation();
  const [type, setType] = useState('bug');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => { setMessage(''); setType('bug'); setSent(false); }, 400);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await api.post('/feedback', { type, message });
      setSent(true);
      setTimeout(handleClose, 2000);
    } catch {
      toast.error(t('errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet — bottom on mobile, centered on desktop */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[90]
                       md:bottom-auto md:top-1/2 md:left-1/2
                       md:-translate-x-1/2 md:-translate-y-1/2
                       md:w-[480px] md:rounded-3xl
                       bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl"
          >
            {/* Handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 md:pt-5">
              <div>
                <h2 className="font-bold text-lg leading-tight">{t('reportProblem')}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{t('reportSubtitle')}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {sent ? (
              /* Success state */
              <div className="flex flex-col items-center gap-3 py-12 px-5 pb-10 md:pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle size={32} className="text-green-500" />
                </motion.div>
                <p className="font-semibold text-center text-base">{t('feedbackSent')}</p>
                <p className="text-sm text-gray-500 text-center">{t('feedbackSentSub')}</p>
              </div>
            ) : (
              /* Form */
              <div className="px-5 pb-8 md:pb-6 space-y-4">
                {/* Type selector */}
                <div className="grid grid-cols-4 gap-2">
                  {TYPES.map(({ key, icon: Icon, color, bg }) => (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
                        type === key
                          ? 'border-black dark:border-white shadow-sm scale-[1.04]'
                          : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                        <Icon size={18} className={color} />
                      </div>
                      <span className="text-[11px] font-medium leading-tight text-center text-gray-700 dark:text-gray-300">
                        {t(`feedback_${key}`)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('feedbackPlaceholder')}
                    rows={4}
                    maxLength={1000}
                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 pr-12"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-gray-400 select-none">
                    {message.length}/1000
                  </span>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || loading}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-2xl transition-all hover:opacity-85 active:scale-[0.97] disabled:opacity-40"
                >
                  <Send size={16} />
                  {loading ? t('loading') : t('submit')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}