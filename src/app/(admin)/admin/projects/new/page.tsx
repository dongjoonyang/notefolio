"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, Eye, EyeOff, LayoutGrid, LayoutList, ChevronRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type ReactQuill from "react-quill-new";

const ReactQuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // @ts-ignore
    const { default: ImageResize } = await import("quill-image-resize-module-react");
    const Quill = RQ.Quill as any;

    if (typeof window !== "undefined") (window as any).Quill = Quill;
    if (!Quill.imports["modules/imageResize"]) Quill.register("modules/imageResize", ImageResize);
    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);
    return RQ;
  },
  { ssr: false, loading: () => <div className="h-80 bg-zinc-50 animate-pulse border-b border-zinc-200" /> }
) as any;

import "react-quill-new/dist/quill.snow.css";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function NewProjectPage() {
  const router = useRouter();
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(""); 
  const [isVisible, setIsVisible] = useState(true);
  const [showInAll, setShowInAll] = useState(true); 
  const [categories, setCategories] = useState<any[]>([]);
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
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      } catch (err) { console.error("카테고리 로딩 실패:", err); }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file });
      const newBlob = await response.json();
      setThumbnail(newBlob.url); 
    } catch (error) { alert("업로드 중 오류 발생"); } finally { setIsUploading(false); }
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) { alert("모든 필드를 입력해주세요."); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categoryName: category, thumbnail, isVisible, showInAll: isVisible ? showInAll : false }),
      });
      if (response.ok) { alert("등록 성공!"); router.push("/admin/projects"); router.refresh(); }
    } catch (error) { alert("네트워크 오류"); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="lg:h-screen flex flex-col bg-white lg:overflow-hidden">
      {/* 1. 헤더 */}
      <header className="shrink-0 w-full bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-6 z-[100]">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-500 hover:text-zinc-900">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Editor</span>
            <h1 className="text-base font-bold text-zinc-900 leading-none">새 프로젝트 작성</h1>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="bg-zinc-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-black transition-all disabled:bg-zinc-300 font-bold text-xs"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isSubmitting ? "저장 중..." : "게시하기"}
        </button>
      </header>

      {/* 메인 레이아웃 */}
      <main className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden bg-white">
        
        {/* 본문 에디터 영역 */}
        <div className="flex-1 flex flex-col bg-white lg:overflow-hidden min-h-0">
          {/* 제목 영역 */}
          <div className="shrink-0 bg-white px-6 lg:px-12 h-24 lg:h-32 flex items-center border-b border-zinc-50">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="w-full text-2xl lg:text-4xl font-black p-0 border-none outline-none placeholder:text-zinc-200 bg-transparent focus:ring-0 text-zinc-900"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 에디터 영역 (컨테이너 높이 고정) */}
          <div className="flex-1 flex flex-col relative overflow-hidden min-h-[400px] lg:min-h-0">
            <ReactQuillEditor
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={editorModules}
              className="editor-custom h-full flex flex-col"
            />
          </div>
        </div>

        {/* 우측 설정 사이드바 */}
        <aside className="w-full lg:w-80 shrink-0 bg-zinc-50/50 lg:border-l border-zinc-200 lg:overflow-y-auto">
          <div className="flex flex-col divide-y divide-zinc-200 min-h-full">
            <section className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Category</label>
                <select 
                  className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Thumbnail</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                    ${thumbnail ? "border-transparent" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}
                >
                  {thumbnail ? (
                    <>
                      <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">변경하기</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 bg-white rounded-full shadow-sm mb-1.5 text-zinc-400 border border-zinc-100">
                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Upload Image</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </section>

            <section className="p-6 space-y-3 pb-20 lg:pb-6">
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status & Visibility</label>
              
              <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-zinc-200 cursor-pointer"
                   onClick={() => { setIsVisible(!isVisible); if(isVisible) setShowInAll(false); }}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isVisible ? "bg-blue-50 text-blue-500" : "bg-zinc-100 text-zinc-400"}`}>
                    {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </div>
                  <span className="text-xs font-bold text-zinc-700">웹사이트 공개</span>
                </div>
                <div className={`w-9 h-4.5 rounded-full transition-colors relative ${isVisible ? "bg-zinc-900" : "bg-zinc-200"}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${isVisible ? "left-5" : "left-0.5"}`} />
                </div>
              </div>

              <div className={`flex items-center justify-between p-3.5 bg-white rounded-xl border transition-all 
                ${!isVisible ? "opacity-40 grayscale cursor-not-allowed border-zinc-100" : "border-zinc-200 cursor-pointer"}`}
                   onClick={() => isVisible && setShowInAll(!showInAll)}>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${showInAll && isVisible ? "bg-purple-50 text-purple-500" : "bg-zinc-100 text-zinc-400"}`}>
                    <LayoutGrid size={16} />
                  </div>
                  <span className="text-xs font-bold text-zinc-700">전체 목록 노출</span>
                </div>
                <div className={`w-9 h-4.5 rounded-full transition-colors relative ${showInAll && isVisible ? "bg-zinc-900" : "bg-zinc-200"}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${showInAll && isVisible ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            </section>
          </div>
        </aside>
      </main>

      <style jsx global>{`
        /* 툴바 고정 및 에디터 내부 스크롤 핵심 설정 */
        .editor-custom { border: none !important; display: flex; flex-direction: column; }
        
        .editor-custom .ql-toolbar {
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 50;
          background: white !important; 
          border-top: none !important;
          border-bottom: 1px solid #f4f4f5 !important;
          border-left: none !important;
          border-right: none !important;
          padding: 10px 24px lg:padding: 10px 32px !important;
        }
        
        .editor-custom .ql-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: none !important;
          font-family: inherit;
          font-size: 16px;
          overflow: hidden; /* 컨테이너 밖으로 내용 안 넘치게 고정 */
        }
        
        /* PC와 모바일 모두 내부 스크롤 강제 */
        .editor-custom .ql-editor { 
          flex: 1;
          overflow-y: auto !important; /* 내부 스크롤 생성 */
          padding: 30px 24px lg:padding: 60px 32px !important; 
          color: #18181b; 
          line-height: 1.8; 
          -webkit-overflow-scrolling: touch;
        }

        /* 데스크톱에서 부모 높이 제어 */
        @media (min-width: 1024px) {
          html, body { overflow: hidden; height: 100%; }
          .editor-custom .ql-editor { height: 100%; }
        }

        /* 모바일에서 브라우저 스크롤은 유지하되 에디터 영역 자체 스크롤 */
        @media (max-width: 1023px) {
          .editor-custom .ql-editor { max-height: 60vh; } /* 모바일에서 에디터 영역이 너무 길어지지 않게 조절 */
        }

        .editor-custom .ql-editor::-webkit-scrollbar { width: 6px; }
        .editor-custom .ql-editor::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 10px; }
        .ql-tooltip { z-index: 110 !important; }
      `}</style>
    </div>
  );
}