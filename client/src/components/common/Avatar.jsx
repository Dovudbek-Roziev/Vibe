export default function Avatar({ src, username, size = 10, online = false, className = '' }) {
  const fallback = `https://ui-avatars.com/api/?name=${username || 'U'}&background=000&color=fff&size=128`;
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <img
        src={src || fallback}
        alt={username}
        className={`w-${size} h-${size} rounded-full object-cover`}
        onError={e => { e.target.src = fallback; }}
      />
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
      )}
    </div>
  );
}