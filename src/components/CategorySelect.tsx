"use client";

import { useRouter } from "next/navigation";

export default function CategorySelect({ 
  categoryStats, 
  categoryId, 
  absoluteTotal 
}: { 
  categoryStats: any[], 
  categoryId: string, 
  absoluteTotal: number 
}) {
  const router = useRouter();

  return (
    <div className="md:hidden">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Category View</p>
      <select 
        onChange={(e) => {
          router.push(e.target.value);
        }}
        value={categoryId ? `/admin/projects?category=${categoryId}` : "/admin/projects"}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm outline-none appearance-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
          backgroundRepeat: 'no-repeat', 
          backgroundPosition: 'right 1rem center', 
          backgroundSize: '1em' 
        }}
      >
        <option value="/admin/projects">ALL PROJECTS ({absoluteTotal})</option>
        {categoryStats.map((stat: any) => (
          <option key={stat.id} value={`/admin/projects?category=${stat.id}`}>
            {stat.name.toUpperCase()} ({stat.projectCount})
          </option>
        ))}
      </select>
    </div>
  );
}