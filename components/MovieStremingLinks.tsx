import { ExternalLink } from "lucide-react";
import Image from "next/image";

export default function MovieStreamingLinks({ streamingPlatforms, rentPlatforms, buyPlatforms, watchLink }: { streamingPlatforms: any[], rentPlatforms: any[], buyPlatforms: any[], watchLink: string }) {
  return (
    <>
      {(streamingPlatforms.length > 0 || rentPlatforms.length > 0 || buyPlatforms.length > 0) && (
          <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full" />
              Where to Watch
            </h2>
            <div className="glass rounded-2xl p-6 space-y-6">
              {streamingPlatforms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Stream</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {streamingPlatforms.map((p: any) => (
                      <div key={p.provider_id} className="relative group">
                        <Image
                          src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                          alt={p.provider_name}
                          width={48}
                          height={48}
                          className="rounded-xl shadow-md group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {p.provider_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rentPlatforms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Rent</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {rentPlatforms.map((p: any) => (
                      <div key={p.provider_id} className="relative group">
                        <Image
                          src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                          alt={p.provider_name}
                          width={40}
                          height={40}
                          className="rounded-lg shadow-md group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {p.provider_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {buyPlatforms.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Buy</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {buyPlatforms.map((p: any) => (
                      <div key={p.provider_id} className="relative group">
                        <Image
                          src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                          alt={p.provider_name}
                          width={40}
                          height={40}
                          className="rounded-lg shadow-md group-hover:scale-110 transition-transform"
                        />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {p.provider_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watchLink && (
                <a
                  href={watchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View all options on JustWatch
                </a>
              )}
            </div>
          </section>
        )}
    </>
  );
}