interface ItemSearchProps {
  value: string;
  onChange: (value: string) => void;
  isFetching?: boolean;
}

const ItemsSearch: React.FC<ItemSearchProps> = ({
  value,
  onChange,
  isFetching = false,
}) => {
  return (
    <div className="relative w-full max-w-sm">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
        />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="w-full h-10 pl-10 pr-10 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        aria-label="Search products"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isFetching ? (
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ItemsSearch;
