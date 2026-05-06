import { useTranslation } from 'react-i18next';
import { useLangStore } from '../../store/langStore';

export default function Footer({ className = '' }) {
  const { t } = useTranslation();
  const { lang, setLang } = useLangStore();

  return (
    <footer className={`text-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-600 font-medium">
        <span>© 2024 <span className="text-black dark:text-white font-bold">Vibe</span></span>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <span>{t('footerAuthor')} | <span className="text-gray-600 dark:text-gray-400">Roziev Dovudbek</span></span>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <button
          onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
          className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
        >
          <span>{lang === 'uz' ? '🇺🇿' : '🇷🇺'}</span>
          <span>{lang === 'uz' ? "O'zbek" : 'Русский'}</span>
        </button>
      </div>
    </footer>
  );
}