const LoadingState = () => (
  <div className="space-y-8 p-4 md:p-6">
    {[1, 2, 3].map((section) => (
      <div key={section} className="space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((card) => (
            <div
              key={card}
              className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default LoadingState;
