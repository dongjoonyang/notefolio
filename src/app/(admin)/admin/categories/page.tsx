"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, GripVertical, Tag } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 개별 행 컴포넌트 (Sortable Item) ---
function SortableRow({ category, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-white border-b last:border-0 transition-colors ${
        isDragging ? "bg-blue-50 shadow-md border-blue-200" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* 드래그 핸들: attributes와 listeners를 여기에만 걸어줍니다 */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1">
          <GripVertical size={18} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <Tag size={14} />
          </div>
          <span className="font-medium text-slate-700">{category.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onEdit(category.id, category.name)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDelete(category.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// --- 메인 페이지 컴포넌트 ---
export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  // 순서 저장 API 호출
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newArray = arrayMove(categories, oldIndex, newIndex);
      
      setCategories(newArray); // 즉시 반영
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
    if (!newCategory.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory }),
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
    if (!newName || newName === currentName) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) fetchCategories();
  };

  return (
    <div className="max-w-2xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm mt-1">드래그하여 메뉴 노출 순서를 변경하세요.</p>
        </div>
        {isUpdating && <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold animate-pulse">순서 업데이트 중...</span>}
      </div>

      <form onSubmit={addCategory} className="flex gap-2 mb-10 bg-white p-2 rounded-2xl border shadow-sm">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="새 카테고리 이름 입력"
          className="flex-1 px-4 py-2 outline-none text-slate-700 font-medium"
        />
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-colors font-bold shadow-lg">
          <Plus size={18} /> 추가
        </button>
      </form>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {categories.map((category) => (
                <SortableRow 
                  key={category.id} 
                  category={category} 
                  onEdit={editCategory} 
                  onDelete={deleteCategory} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {categories.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-sm">등록된 카테고리가 없습니다.</div>
        )}
      </div>
    </div>
  );
}