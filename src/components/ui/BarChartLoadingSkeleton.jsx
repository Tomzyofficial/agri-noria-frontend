export default function BarChartLoading() {
  const bars = [40, 80, 60, 120, 90, 70];

  return (
    <div className="h-full w-full shimmer col-span-2 rounded-2xl">
      <div className="flex h-full">
        {/* Y Axis */}
        <div className="flex flex-col justify-between py-4 pr-3">
          {[100, 75, 50, 25, 0].map((_, i) => (
            <div
              key={i}
              className="h-2 w-6 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>

        {/* Chart Area */}
        <div className="relative flex-1">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-px w-full bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex h-full items-end justify-around px-4 pb-8">
            {bars.map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="w-10 rounded-t-md bg-gray-300 dark:bg-gray-600"
                  style={{ height }}
                />
                <div className="h-2 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>

          {/* X Axis */}
          <div className="absolute bottom-6 left-0 right-0 h-px bg-gray-300 dark:bg-gray-600" />
        </div>
      </div>
    </div>
  );
}
