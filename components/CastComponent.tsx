import { Film } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Casts({cast}: any) {
    const router = useRouter();
    return(
        <section className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 stagger-children">
              {cast.map((actor: any) => (
                <div key={actor.id} className="text-center hover:cursor-pointer group" onClick={() => { router.push(`/person/${actor.id}`) }}>
                  {actor.profile_path ? (
                    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-slate-800">
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        width={185}
                        height={278}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-xl bg-slate-800/80 flex items-center justify-center mb-2">
                      <Film className="h-8 w-8 text-slate-600" />
                    </div>
                  )}
                  <p className="text-xs font-medium text-white truncate">{actor.name}</p>
                  <p className="text-xs text-slate-500 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
    )
}