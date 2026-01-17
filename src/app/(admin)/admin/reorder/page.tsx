"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Save, ArrowLeft, ChevronDown } from "lucide-react"; // ChevronDown 추가
import { useRouter } from "next/navigation";

// --- 개별 카드 컴포넌트 (기존 유지) ---
function SortableCard({ project }: { project: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl overflow-hidden shadow-sm ${isDragging ? "ring-2 ring-blue-500 opacity-50" : ""}`}>
      <div className="relative aspect-video bg-gray-100">
        <div {...attributes} {...listeners} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg cursor-grab active:cursor-grabbing z-10">
          <GripVertical size={16} />
        </div>
        {project.thumbnail && <img src={project.thumbnail} className="w-full h-full object-cover" />}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold truncate">{project.title}</h3>
        <p className="text-[10px] text-blue-600 font-semibold mt-1">{project.categoryName}</p>
      </div>
    </div>
  );
}

// --- 메인 페이지 컴포넌트 ---
export default function ReorderPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // 데이터 로딩 (기존 유지)
  useEffect(() => {
    const fetchData = async () => {
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/projects?limit=100&t=${Date.now()}`), 
        fetch("/api/categories")
      ]);
      setProjects(await pRes.json());
      setCategories(await cRes.json());
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return filter === "all" ? projects : projects.filter(p => p.categoryName === filter);
  }, [filter, projects]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((i) => i.id === active.id);
      const newIndex = projects.findIndex((i) => i.id === over.id);
      const newArray = arrayMove(projects, oldIndex, newIndex);
      
      setProjects(newArray);
      setIsSaving(true);

      try {
        await fetch("/api/projects/reorder", {
          method: "POST",
          body: JSON.stringify({ ids: newArray.map(p => p.id) }),
        });
        router.refresh(); 
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8 md:mb-10">
        <div>
          <a href="/admin" className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 mb-2">
            <ArrowLeft size={12}/> Back to Admin
          </a>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">순서 관리</h1>
        </div>
        {isSaving && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 animate-pulse uppercase tracking-widest shadow-lg shadow-blue-500/30">
            <Save size={14}/> Saving...
          </div>
        )}
      </header>

      {/* --- 카테고리 필터 영역 --- */}
      <div className="mb-8">
        {/* 모바일: 셀렉트 박스 형태 (md:hidden) */}
        <div className="md:hidden">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Filter Category</p>
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm outline-none appearance-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* 데스크탑: 기존 버튼 형태 (hidden md:flex) */}
        <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition ${filter === "all" ? "bg-black text-white" : "bg-white border border-gray-100 hover:border-gray-300"}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setFilter(cat.name)} 
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition whitespace-nowrap ${filter === cat.name ? "bg-blue-600 text-white" : "bg-white border border-gray-100 hover:border-gray-300"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredItems} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((project) => (
              <SortableCard key={project.id} project={project} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}