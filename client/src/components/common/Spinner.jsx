export default function Spinner({ size = 6 }) {
  return (
    <div
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      className="border-2 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white rounded-full animate-spin"
    />
  );
}

export function DotsLoader() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce-dot"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </div>
  );
}