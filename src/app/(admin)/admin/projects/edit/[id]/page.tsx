'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Image as ImageIcon, X } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import BackButton from "@/components/BackButton";
import Image from "next/image";

// ✨ 1. 리사이즈 및 정렬 모듈 설정 (타입 에러 완전 해결)
// 마지막에 'as any'를 붙여 컴포넌트 사용 시 Props 검사를 끕니다.
const ReactQuill = dynamic(
  async () => {
    const { default: RQ }: any = await import("react-quill-new");
    const { default: ImageResize } = await import("quill-image-resize-module-react");
    const Quill = RQ.Quill as any;

    // 이미지 정렬 스타일 등록
    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);

    if (typeof window !== 'undefined') { 
      (window as any).Quill = Quill; 
    }
    
    if (!Quill.imports["modules/imageResize"]) {
      Quill.register("modules/imageResize", ImageResize);
    }
    // 내부 반환값도 any로 처리
    return RQ as any;
  },
  { 
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />
  }
) as any; 

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); 
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(""); 
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ 2. 에디터 모듈 설정
  const editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ 'align': [] }], 
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "code-block"],
      ["clean"],
    ],
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, projRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/projects/detail?id=${id}`)
        ]);

        if (!catRes.ok || !projRes.ok) throw new Error("데이터 로딩 실패");

        const catData = await catRes.json();
        const projData = await projRes.json();

        setCategories(catData);
        
        if (projData) {
          setTitle(projData.title || "");
          // content 필드가 없을 경우를 대비해 description도 확인
          setContent(projData.content || projData.description || ""); 
          setCategory(projData.categoryName || "");
          setThumbnail(projData.thumbnail || "");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("2MB 이하의 이미지를 사용해주세요.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setThumbnail(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !category) {
      alert("제목과 카테고리를 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          categoryName: category,
          thumbnail 
        }),
      });

      if (res.ok) {
        alert('수정되었습니다!');
        router.push('/admin/projects');
        router.refresh();
      } else {
        const err = await res.json();
        alert(`수정 실패: ${err.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("네트워크 오류");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tighter">Edit Project</h1>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={isSubmitting}
          className="bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-all font-bold disabled:bg-slate-400 shadow-sm uppercase text-sm"
        >
          <Save size={18} />
          {isSubmitting ? "Saving..." : "Update"}
        </button>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        {/* 제목 입력부 */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-black p-0 border-none outline-none bg-transparent focus:ring-0 placeholder:text-slate-200 uppercase"
            placeholder="ENTER TITLE"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all cursor-pointer font-bold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">SELECT CATEGORY</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 썸네일 관리 */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thumbnail</label>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black transition-colors text-slate-600 border border-slate-200 uppercase"
              >
                <ImageIcon size={16} />
                Change Image
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {thumbnail && (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                  <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                  <button 
                    type="button" // form 전송 방지
                    onClick={() => setThumbnail("")}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 에디터 본문 */}
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={editorModules} 
              className="h-96 mb-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}