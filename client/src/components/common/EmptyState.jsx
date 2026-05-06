export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {Icon && <Icon size={48} className="text-gray-300 dark:text-gray-700 mb-4" />}
      <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}