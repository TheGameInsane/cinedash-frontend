"use client";

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  BarChart2,
  StarIcon,
  HistoryIcon,
  Bookmark,
} from "lucide-react";
import Recommended from "./tabs/Recommended";
import Stats from "./tabs/Stats";
import WatchLater from "./tabs/WatchLater";
import History from "./tabs/History";

enum Tabs {
  Recommended,
  History,
  Stats,
  WatchLater,
}

const tabsMap = new Map<Tabs, JSX.Element>([
  [Tabs.Recommended, <Recommended />],
  [Tabs.History, <History />],
  [Tabs.Stats, <Stats />],
  [Tabs.WatchLater, <WatchLater />],
]);

const tabMeta = [
  { tab: Tabs.Recommended, icon: StarIcon, label: "For You", activeColor: "bg-indigo-500" },
  { tab: Tabs.History, icon: HistoryIcon, label: "History", activeColor: "bg-violet-500" },
  { tab: Tabs.Stats, icon: BarChart2, label: "Stats", activeColor: "bg-amber-500" },
  { tab: Tabs.WatchLater, icon: Bookmark, label: "Saved", activeColor: "bg-rose-500" },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tab, setTab] = useState<Tabs>(Tabs.Recommended);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <main className="flex flex-col md:flex-row">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:block md:w-24 lg:w-28">
        <div className="fixed z-50 top-24 left-4 lg:left-10 h-[85vh] w-20 border border-slate-500/20 rounded-full bg-slate-900/40 backdrop-blur-xl">
          <div className="flex flex-col justify-center items-center gap-4 py-20">
            {tabMeta.map(({ tab: t, icon: Icon, label, activeColor }) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  tab === t
                    ? `${activeColor} text-white shadow-lg`
                    : "text-slate-500 hover:text-white hover:bg-slate-800/40"
                }`}
                title={label}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        {tabsMap.get(tab)}
      </div>

      {/* Mobile Bottom Bar — visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="mx-3 mb-3 flex items-center justify-around gap-1 py-2 px-2 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/40 shadow-lg shadow-black/30">
          {tabMeta.map(({ tab: t, icon: Icon, label, activeColor }) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 ${
                tab === t
                  ? `${activeColor} text-white shadow-md`
                  : "text-slate-500 active:bg-slate-800/40"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
