"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react"; 
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    // @ts-ignore
    const { default: ImageResize } = await import("quill-image-resize-module-react");
    const Quill = RQ.Quill as any;

    // ✨ 중요: 리사이즈 모듈은 글로벌 Quill 객체를 참조합니다.
    if (typeof window !== "undefined") {
      (window as any).Quill = Quill;
    }

    // 모듈 중복 등록 방지 및 등록
    if (!Quill.imports["modules/imageResize"]) {
      Quill.register("modules/imageResize", ImageResize);
    }

    // 이미지에 float(정렬) 스타일을 직접 허용하는 설정
    const AlignStyle = Quill.import('attributors/style/align');
    Quill.register(AlignStyle, true);

    return RQ;
  },
  {
    ssr: false,
    loading: () => <div className="h-80 bg-gray-50 animate-pulse rounded-xl border border-gray-200" />,
  }
);

import "react-quill-new/dist/quill.snow.css";

export default function NewProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(""); 
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ 'align': [] }], 
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
    // ✨ 리사이즈 설정 (Toolbar 제외하여 에러 방지)
    imageResize: {
      modules: ["Resize", "DisplaySize"],
    },
  };

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setThumbnail(reader.result as string);
      reader.readAsDataURL(file);
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
        body: JSON.stringify({ title, content, categoryName: category, thumbnail }),
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
          disabled={isSubmitting}
          className="bg-black text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-all disabled:bg-zinc-400 font-medium"
        >
          <Save size={18} />
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
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors text-slate-600 border border-slate-200"
              >
                <ImageIcon size={16} />
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

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">상세 설명</label>
          <div className="rounded-xl overflow-hidden border border-slate-200 min-h-[400px]">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={editorModules}
              className="h-[350px] mb-12"
            />
          </div>
        </div>
      </div>
    </div>
  );
}