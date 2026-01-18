'use client';

import { useState, useEffect, use, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Image as ImageIcon, X, Loader2, ArrowLeft, Eye, EyeOff, LayoutGrid, LayoutList } from "lucide-react";
import 'react-quill-new/dist/quill.snow.css';
import Image from "next/image";
import type ReactQuill from "react-quill-new";

// 서버 액션 임포트
import { updateProject } from "@/lib/actions";

// 에디터 로드 설정
const ReactQuillEditor = dynamic(
  async () => {
    const { default: RQ }: any = await import("react-quill-new");
    const { default: ImageResize } = await import("quill-image-resize-module-react");
    const Quill = RQ.Quill as any;

    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);

    if (typeof window !== 'undefined') { (window as any).Quill = Quill; }
    
    if (!Quill.imports["modules/imageResize"]) {
      Quill.register("modules/imageResize", ImageResize);
    }
    return RQ;
  },
  { 
    ssr: false,
    loading: () => <div className="h-80 bg-zinc-50 animate-pulse rounded-2xl border border-zinc-200" />
  }
) as any; 

const MAX_FILE_SIZE = 4 * 1024 * 1024; 

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); 
  const [category, setCategory] = useState(''); 
  const [thumbnail, setThumbnail] = useState(""); 
  const [isVisible, setIsVisible] = useState(true);
  const [showInAll, setShowInAll] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const imageHandler = useMemo(() => {
    return () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
          alert("이미지 용량이 너무 큽니다. 4MB 이하의 파일만 업로드 가능합니다.");
          return;
        }

        try {
          setIsUploading(true);
          const response = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
          const newBlob = await response.json();
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, "image", newBlob.url);
            editor.setSelection(range.index + 1);
          }
        } catch (error) {
          alert("이미지 업로드에 실패했습니다.");
        } finally {
          setIsUploading(false);
        }
      };
    };
  }, []);

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
      handlers: { image: imageHandler },
    },
    imageResize: { modules: ["Resize", "DisplaySize"] },
  }), [imageHandler]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, projRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/projects/detail?id=${id}`)
        ]);
        const catData = await catRes.json();
        const projData = await projRes.json();
        setCategories(catData);
        if (projData) {
          setTitle(projData.title || "");
          setContent(projData.description || ""); 
          const currentCat = catData.find((c: any) => c.name === projData.categoryName);
          setCategory(currentCat ? String(currentCat.id) : "");
          setThumbnail(projData.thumbnail || "");
          setIsVisible(Number(projData.isVisible) !== 0);
          setShowInAll(Number(projData.showInAll) !== 0);
        }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    if (id) fetchData();
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
      const newBlob = await response.json();
      setThumbnail(newBlob.url);
    } catch (error) { alert("이미지 업로드 오류"); } finally { setIsUploading(false); }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !category) { alert("제목과 카테고리를 확인해주세요."); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", content);
      formData.append("categoryId", category); 
      formData.append("thumbnail", thumbnail);
      formData.append("isVisible", isVisible ? "1" : "0");
      formData.append("showInAll", showInAll ? "1" : "0");
      await updateProject(Number(id), formData);
      alert('수정되었습니다!');
      router.push('/admin/projects');
      router.refresh();
    } catch (err: any) {
      if (!err.message?.includes('NEXT_REDIRECT')) alert("수정 중 오류 발생");
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-400 font-black uppercase tracking-widest text-xs">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 🔹 상단 플로팅 헤더 */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-zinc-100 rounded-full transition-all text-zinc-500 hover:text-zinc-900">
              <ArrowLeft size={22} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Editing Mode</span>
              <h1 className="text-lg font-bold text-zinc-900 leading-none truncate max-w-[200px] md:max-w-md">프로젝트 수정</h1>
            </div>
          </div>
          <button 
            onClick={handleUpdate}
            disabled={isSubmitting || isUploading}
            className="group bg-zinc-900 text-white px-7 py-3 rounded-full flex items-center gap-2.5 hover:bg-black transition-all disabled:bg-zinc-300 font-bold text-sm shadow-sm"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            {isSubmitting ? "Saving..." : "업데이트 완료"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 🔹 왼쪽: 본문 작성 영역 */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-zinc-200/60 shadow-sm">
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2">Project Title</label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                className="w-full text-4xl font-black p-0 border-none outline-none placeholder:text-zinc-200 bg-transparent focus:ring-0 text-zinc-900 mb-8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="prose prose-zinc max-w-none">
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4">Description Content</label>
                <div className="min-h-[500px] border-t border-zinc-100 pt-6">
                  <ReactQuillEditor
                    ref={quillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={editorModules}
                    className="editor-custom"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 🔹 오른쪽: 설정 사이드바 */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 카테고리 & 썸네일 */}
            <section className="bg-white p-6 rounded-[28px] border border-zinc-200/60 shadow-sm space-y-6 sticky top-28">
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Category Selection</label>
                <select 
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 cursor-pointer appearance-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Thumbnail Preview</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group
                    ${thumbnail ? "border-transparent shadow-md" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"}`}
                >
                  {thumbnail ? (
                    <>
                      <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-[10px] font-black uppercase bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">이미지 변경</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-zinc-400">
                        {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <p className="text-[10px] font-black text-zinc-400 uppercase">Click to Upload</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              {/* 노출 설정 스위치 */}
              <div className="space-y-3 pt-2">
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status & Visibility</label>
                
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 cursor-pointer"
                     onClick={() => { setIsVisible(!isVisible); if(isVisible) setShowInAll(false); }}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isVisible ? "bg-blue-50 text-blue-500" : "bg-zinc-200 text-zinc-500"}`}>
                      {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                    <span className="text-xs font-bold text-zinc-700">웹사이트 공개</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${isVisible ? "bg-zinc-900" : "bg-zinc-300"}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isVisible ? "left-6" : "left-1"}`} />
                  </div>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all 
                  ${!isVisible ? "opacity-40 grayscale cursor-not-allowed" : "bg-zinc-50 border-zinc-100 cursor-pointer"}`}
                     onClick={() => isVisible && setShowInAll(!showInAll)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${showInAll && isVisible ? "bg-purple-50 text-purple-500" : "bg-zinc-200 text-zinc-500"}`}>
                      <LayoutGrid size={18} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700">전체 목록 노출</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${showInAll && isVisible ? "bg-zinc-900" : "bg-zinc-300"}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showInAll && isVisible ? "left-6" : "left-1"}`} />
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .editor-custom .ql-container { border: none !important; font-family: inherit; font-size: 16px; }
        .editor-custom .ql-toolbar { border: none !important; border-bottom: 1px solid #f4f4f5 !important; padding: 8px 0 20px 0 !important; margin-bottom: 20px; }
        .editor-custom .ql-editor { padding: 0 !important; color: #18181b; min-height: 400px; }
      `}</style>
    </div>
  );
}