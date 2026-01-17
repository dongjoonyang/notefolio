"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X, Loader2, Eye, EyeOff, LayoutGrid, LayoutList } from "lucide-react";
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
      } catch (err) {
        console.error("카테고리 로딩 실패:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("썸네일 용량이 너무 큽니다.");
      return;
    }
    try {
      setIsUploading(true);
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });
      const newBlob = await response.json();
      setThumbnail(newBlob.url); 
    } catch (error) {
      alert("업로드 중 오류 발생");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !category) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          content, 
          categoryName: category, 
          thumbnail, 
          isVisible, // boolean으로 전달 (API에서 처리)
          showInAll: isVisible ? showInAll : false // 비공개면 강제로 false 처리
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
            className="w-full text-2xl font-bold p-0 border-none outline-none placeholder:text-slate-200 bg-transparent focus:ring-0 text-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">카테고리</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black text-black"
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
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors border border-slate-200"
              >
                <ImageIcon size={16} /> 이미지 업로드
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

        {/* ✅ 수정된 노출 설정 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 웹사이트 공개 (부모) */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="isVisible"
              checked={isVisible}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsVisible(checked);
                if (!checked) setShowInAll(false); // 비공개 시 All Works도 자동 해제
              }}
              className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-black"
            />
            <label htmlFor="isVisible" className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
              {isVisible ? <Eye size={16} className="text-blue-500" /> : <EyeOff size={16} className="text-slate-400" />}
              {isVisible ? "웹사이트 공개" : "비공개 저장"}
            </label>
          </div>

          {/* 전체 목록 노출 (자식: isVisible에 의존) */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
            !isVisible ? "bg-gray-100 border-gray-200 opacity-50" : "bg-slate-50 border-slate-100"
          }`}>
            <input
              type="checkbox"
              id="showInAll"
              checked={showInAll}
              disabled={!isVisible} // 💡 비활성화 핵심
              onChange={(e) => setShowInAll(e.target.checked)}
              className={`w-5 h-5 rounded border-gray-300 text-black focus:ring-black ${!isVisible ? "cursor-not-allowed" : "cursor-pointer accent-black"}`}
            />
            <label 
              htmlFor="showInAll" 
              className={`flex items-center gap-2 text-sm font-bold select-none ${!isVisible ? "text-slate-400 cursor-not-allowed" : "text-slate-700 cursor-pointer"}`}
            >
              {showInAll && isVisible ? <LayoutGrid size={16} className="text-purple-500" /> : <LayoutList size={16} className="text-slate-400" />}
              {showInAll ? "전체 목록 노출" : "전체 목록 제외"}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2 text-black">상세 설명</label>
          <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[400px]">
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