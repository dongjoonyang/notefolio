"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, Eye, EyeOff, LayoutGrid, LayoutList, ChevronRight } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type ReactQuill from "react-quill-new";

// 에디터 로드 설정
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
  { ssr: false, loading: () => <div className="h-80 bg-zinc-50 animate-pulse rounded-2xl border border-zinc-200" /> }
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

  // 이미지 핸들러 로직 (기존과 동일)
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
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* 🔹 상단 플로팅 헤더 */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/projects" className="p-2.5 hover:bg-zinc-100 rounded-full transition-all text-zinc-500 hover:text-zinc-900">
              <ArrowLeft size={22} />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Editor</span>
              <h1 className="text-lg font-bold text-zinc-900 leading-none">새 프로젝트 작성</h1>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="group relative bg-zinc-900 text-white px-7 py-3 rounded-full flex items-center gap-2.5 hover:bg-black transition-all disabled:bg-zinc-300 font-bold text-sm"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
            {isSubmitting ? "저장 중..." : "게시하기"}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 🔹 왼쪽: 본문 작성 영역 (8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-zinc-200/60 shadow-sm">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                className="w-full text-4xl font-black p-0 border-none outline-none placeholder:text-zinc-200 bg-transparent focus:ring-0 text-zinc-900 mb-8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="prose prose-zinc max-w-none">
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4">Content Body</label>
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

          {/* 🔹 오른쪽: 설정 사이드바 (4) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* 카테고리 & 썸네일 */}
            <section className="bg-white p-6 rounded-[28px] border border-zinc-200/60 shadow-sm space-y-6">
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Category</label>
                <select 
                  className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3.5 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 appearance-none cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-3">Thumbnail</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden
                    ${thumbnail ? "border-transparent" : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100"}`}
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
                      <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-zinc-400">
                        {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase">Upload Image</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </section>

            {/* 노출 설정 */}
            <section className="bg-white p-6 rounded-[28px] border border-zinc-200/60 shadow-sm space-y-3">
              <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status & Visibility</label>
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group cursor-pointer"
                   onClick={() => { setIsVisible(!isVisible); if(isVisible) setShowInAll(false); }}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isVisible ? "bg-blue-50 text-blue-500" : "bg-zinc-200 text-zinc-500"}`}>
                    {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  <span className="text-sm font-bold text-zinc-700">웹사이트 공개</span>
                </div>
                <input type="checkbox" checked={isVisible} readOnly className="sr-only" />
                <div className={`w-10 h-5 rounded-full transition-colors relative ${isVisible ? "bg-zinc-900" : "bg-zinc-300"}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isVisible ? "left-6" : "left-1"}`} />
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all 
                ${!isVisible ? "bg-zinc-50/50 opacity-40 grayscale cursor-not-allowed" : "bg-zinc-50 border-zinc-100 cursor-pointer"}`}
                   onClick={() => isVisible && setShowInAll(!showInAll)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${showInAll && isVisible ? "bg-purple-50 text-purple-500" : "bg-zinc-200 text-zinc-500"}`}>
                    <LayoutGrid size={18} />
                  </div>
                  <span className="text-sm font-bold text-zinc-700">전체 목록 노출</span>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors relative ${showInAll && isVisible ? "bg-zinc-900" : "bg-zinc-300"}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showInAll && isVisible ? "left-6" : "left-1"}`} />
                </div>
              </div>
            </section>

            {/* 안내 문구 */}
            <p className="px-4 text-[11px] text-zinc-400 leading-relaxed">
              * 저장된 프로젝트는 즉시 웹사이트에 반영됩니다. <br/>
              * 썸네일 권장 해상도는 16:9 비율입니다.
            </p>
          </aside>

        </div>
      </main>

      {/* 🔹 에디터 스타일 커스텀을 위한 글로벌 스타일 */}
      <style jsx global>{`
        .editor-custom .ql-container {
          border: none !important;
          font-family: inherit;
          font-size: 16px;
          /* 💡 아래 부분을 추가하여 에디터 컨테이너 자체가 최소 높이를 가지게 합니다 */
          min-height: 500px; 
          cursor: text;
        }
        .editor-custom .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f4f4f5 !important;
          padding: 8px 0 20px 0 !important;
          margin-bottom: 20px;
        }
        .editor-custom .ql-editor {
          padding: 0 !important;
          color: #18181b;
          /* 💡 에디터 내부 입력창이 영역 전체를 채우도록 설정합니다 */
          min-height: 500px; 
        }
        .editor-custom .ql-editor.ql-blank::before {
          left: 0 !important;
          font-style: normal;
          color: #e4e4e7;
        }
      `}</style>
    </div>
  );
}