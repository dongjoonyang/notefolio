"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, Tag, Loader2 } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 개별 행 컴포넌트 ---
function SortableRow({ category, onEdit, onDelete, onToggle }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  const rawValue = category.isVisible !== undefined ? category.isVisible : category.is_visible;
  const isOn = rawValue === undefined ? true : Number(rawValue) !== 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 sm:p-4 bg-white border-b border-zinc-100 last:border-0 transition-all ${
        isDragging ? "bg-zinc-50 shadow-lg scale-[1.02] z-50" : "hover:bg-zinc-50/50"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 p-2 -ml-2">
          <GripVertical size={18} />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${!isOn ? "bg-zinc-100 text-zinc-400" : "bg-blue-50 text-blue-500"}`}>
            <Tag size={14} />
          </div>
          <span className={`font-bold text-sm sm:text-base truncate transition-all ${!isOn ? "text-zinc-300" : "text-zinc-800"}`}>
            {category.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-2">
        <button
          type="button"
          onClick={() => onToggle(category.id, rawValue)}
          className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            isOn ? "bg-zinc-900" : "bg-zinc-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
              isOn ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1 border-l border-zinc-100 pl-2 sm:pl-3">
          <button onClick={() => onEdit(category.id, category.name)} className="p-1.5 sm:p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(category.id)} className="p-1.5 sm:p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newArray = arrayMove(categories, oldIndex, newIndex);
      setCategories(newArray);
      setIsUpdating(true);
      await fetch("/api/categories/reorder", {
        method: "POST",
        body: JSON.stringify({ ids: newArray.map(c => c.id) }),
      });
      setIsUpdating(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategory.trim();
    if (!trimmedName) return;

    // 💡 중복 체크 (기존 카테고리 배열에서 이름 비교)
    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      alert("이미 존재하는 카테고리 이름입니다.");
      return;
    }

    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: trimmedName, isVisible: 1 }),
    });
    if (res.ok) { setNewCategory(""); fetchCategories(); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchCategories();
  };

  const editCategory = async (id: number, currentName: string) => {
    const newName = prompt("수정할 카테고리 이름을 입력하세요:", currentName);
    if (!newName) return;
    const trimmedNewName = newName.trim();
    if (trimmedNewName === currentName) return;

    // 💡 수정 시 중복 체크
    const isDuplicate = categories.some(
      (cat) => cat.id !== id && cat.name.toLowerCase() === trimmedNewName.toLowerCase()
    );

    if (isDuplicate) {
      alert("이미 존재하는 카테고리 이름입니다.");
      return;
    }

    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: trimmedNewName }),
    });
    if (res.ok) fetchCategories();
  };

  const toggleCategory = async (id: number, currentVisible: any) => {
    const isNowVisible = currentVisible === undefined ? 1 : Number(currentVisible);
    const newVisible = isNowVisible === 1 ? 0 : 1;

    setCategories(prev => 
      prev.map(cat => cat.id === id ? { ...cat, isVisible: newVisible } : cat)
    );

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisible }),
      });
      if (!res.ok) fetchCategories();
    } catch (error) {
      fetchCategories();
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-2xl mx-auto p-5 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Categories</h1>
          <p className="text-zinc-500 text-xs sm:text-sm font-medium">관리자 카테고리 설정 및 순서 관리</p>
        </div>
        {isUpdating && (
          <div className="flex items-center gap-2 text-[10px] sm:text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold border border-blue-100 animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            저장 중...
          </div>
        )}
      </div>

      <form onSubmit={addCategory} className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm focus-within:border-zinc-900 transition-all">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="카테고리 이름 입력"
          className="flex-1 px-3 sm:px-4 py-2 outline-none text-zinc-800 font-bold text-sm sm:text-base placeholder:text-zinc-300 bg-transparent"
        />
        <button className="bg-zinc-900 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 hover:bg-black active:scale-95 transition-all font-black text-xs sm:text-sm shadow-md shrink-0">
          <Plus size={18} strokeWidth={3} /> 추가
        </button>
      </form>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {categories.map((category) => (
                <SortableRow 
                  key={category.id} 
                  category={category} 
                  onEdit={editCategory} 
                  onDelete={deleteCategory} 
                  onToggle={toggleCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {categories.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <Tag size={32} className="opacity-20" />
            <p className="text-sm font-medium">등록된 카테고리가 없습니다.</p>
          </div>
        )}
      </div>
      
      <p className="mt-6 text-center text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-widest">
        Drag handle to reorder categories
      </p>
    </div>
  );
}