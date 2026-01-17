"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, Eye, EyeOff, LayoutGrid, LayoutList } from "lucide-react"; // ✅ 아이콘 추가
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

    if (typeof window !== "undefined") {
      (window as any).Quill = Quill;
    }

    if (!Quill.imports["modules/imageResize"]) {
      Quill.register("modules/imageResize", ImageResize);
    }

    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);

    return RQ;
  },
  {
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />,
  }
) as any;

import "react-quill-new/dist/quill.snow.css";

// ✅ 상수 정의: 4MB 제한
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
  const [showInAll, setShowInAll] = useState(true); // ✅ [추가] 전체 페이지 노출 State 추가
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ 에디터 이미지 핸들러
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setCategory(data[0].name);
      } catch (err) {
        console.error("카테고리 로딩 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 썸네일 업로드 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("썸네일 용량이 너무 큽니다. 4MB 이하의 이미지만 업로드 가능합니다.");
      e.target.value = ""; 
      return;
    }

    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      if (!response.ok) throw new Error("업로드 실패");
      const newBlob = await response.json();
      setThumbnail(newBlob.url); 
    } catch (error) {
      console.error("Thumbnail Upload Error:", error);
      alert("썸네일 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (isUploading) {
      alert("이미지가 업로드 중입니다. 잠시만 기다려주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ [수정] showInAll 데이터 추가 전송
        body: JSON.stringify({ 
          title, 
          content, 
          categoryName: category, 
          thumbnail, 
          isVisible: isVisible ? 1 : 0,
          showInAll: showInAll ? 1 : 0
        }),
      });
      if (response.ok) {
        alert("등록 성공!");
        router.push("/admin/projects");
        router.refresh();
      }
    } catch (error) {
      alert("네트워크 오류");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">새 프로젝트 등록</h1>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-all disabled:bg-zinc-400 font-medium"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isSubmitting ? "저장 중..." : "저장하기"}
        </button>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">프로젝트 제목</label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="w-full text-2xl font-bold p-0 border-none outline-none placeholder:text-slate-200 bg-transparent focus:ring-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">카테고리</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">썸네일 이미지</label>
            <div className="flex items-center gap-4">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  isUploading 
                    ? "bg-slate-50 text-slate-400 border-slate-100" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
                }`}
              >
                {isUploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                이미지 업로드
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              {thumbnail && (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 group">
                  <Image src={thumbnail} alt="Preview" fill className="object-cover" />
                  <button onClick={() => setThumbnail("")} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ [수정] 노출 설정 섹션 (토글 2개 배치) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="isVisible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
            />
            <label htmlFor="isVisible" className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
              {isVisible ? <Eye size={16} className="text-blue-500" /> : <EyeOff size={16} className="text-slate-400" />}
              {isVisible ? "웹사이트 공개" : "비공개 저장"}
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="showInAll"
              checked={showInAll}
              onChange={(e) => setShowInAll(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
            />
            <label htmlFor="showInAll" className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
              {showInAll ? <LayoutGrid size={16} className="text-purple-500" /> : <LayoutList size={16} className="text-slate-400" />}
              {showInAll ? "전체 목록 노출" : "전체 목록 제외"}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">상세 설명</label>
          <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[400px] ">
            <ReactQuillEditor
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={editorModules}
              className="h-[350px] mb-12 text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}