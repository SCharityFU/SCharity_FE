export default function GlobalPageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
            <div className="space-y-3 animate-pulse">
                <div className="h-7 w-44 rounded-lg bg-black/10" />
                <div className="h-4 w-72 rounded bg-black/5" />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-40 rounded-2xl bg-black/5 animate-pulse" />
                <div className="h-40 rounded-2xl bg-black/5 animate-pulse" />
                <div className="h-64 rounded-2xl bg-black/5 animate-pulse md:col-span-2" />
            </div>
        </div>
    );
}
