'use client';

import { useState, useEffect, use, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Image as ImageIcon, X, Loader2, ArrowLeft } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import Image from "next/image";
import type ReactQuill from "react-quill-new";

// 1. 에디터 로드 설정 (정렬 및 리사이즈 포함)
const ReactQuillEditor = dynamic(
  async () => {
    const { default: RQ }: any = await import("react-quill-new");
    const { default: ImageResize } = await import("quill-image-resize-module-react");
    const Quill = RQ.Quill as any;

    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);

    if (typeof window !== 'undefined') { 
      (window as any).Quill = Quill; 
    }
    
    if (!Quill.imports["modules/imageResize"]) {
      Quill.register("modules/imageResize", ImageResize);
    }
    return RQ;
  },
  { 
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />
  }
) as any; 

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  // Ref 설정
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); 
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState(""); 
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태 추가

  // 2. 에디터 전용 이미지 핸들러 (Vercel Blob 업로드)
  const imageHandler = useMemo(() => {
    return () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try {
          setIsUploading(true);
          const response = await fetch(`/api/upload?filename=${file.name}`, {
            method: 'POST',
            body: file,
          });

          if (!response.ok) throw new Error("업로드 실패");
          const newBlob = await response.json();

          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", newBlob.url);
            editor.setSelection(range.index + 1);
          }
        } catch (error) {
          console.error("Editor Upload Error:", error);
          alert("이미지 업로드에 실패했습니다.");
        } finally {
          setIsUploading(false);
        }
      };
    };
  }, []);

  // 3. 에디터 모듈 설정 (handlers 추가)
  const editorModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ 'align': [] }], 
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  }), [imageHandler]);

  // 데이터 로딩
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

  // 4. 썸네일 이미지 업로드 (Vercel Blob 적용)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error("업로드 실패");
      const newBlob = await response.json();
      setThumbnail(newBlob.url); // 결과 URL을 썸네일로 설정
    } catch (error) {
      console.error("Thumbnail Upload Error:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !category) {
      alert("제목과 카테고리를 확인해주세요.");
      return;
    }
    if (isUploading) {
      alert("이미지가 아직 업로드 중입니다.");
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
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tighter">Edit Project</h1>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={isSubmitting || isUploading}
          className="bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-all font-bold disabled:bg-slate-400 shadow-sm uppercase text-sm"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSubmitting ? "Saving..." : "Update"}
        </button>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
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

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Thumbnail</label>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black transition-colors text-slate-600 border border-slate-200 uppercase"
              >
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                {isUploading ? "Uploading..." : "Change Image"}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {thumbnail && (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 group shadow-sm">
                  <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                  <button 
                    type="button"
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

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-inner">
            <ReactQuillEditor
              ref={quillRef}
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