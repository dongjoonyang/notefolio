"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Lock, Send, Trash2, CornerDownRight } from "lucide-react";

export default function CommentSection({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const [comments, setComments] = useState<any[]>([]);
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [totalCount, setTotalCount] = useState(0); 

  const [replyingTo, setReplyingTo] = useState<number | null>(null); 
  const [replyContent, setReplyContent] = useState("");

  const fetchComments = async () => {
    const res = await fetch(`/api/projects/${projectId}/comments`);
    const data = await res.json();
    setTotalCount(data.length);
  
    const commentMap: any = {};
    data.forEach((comment: any) => {
      commentMap[comment.id] = { ...comment, children: [] };
    });
  
    const tree: any[] = [];
    data.forEach((comment: any) => {
      if (comment.parentId) {
        if (commentMap[comment.parentId]) {
          commentMap[comment.parentId].children.push(commentMap[comment.id]);
        }
      } else {
        tree.push(commentMap[comment.id]);
      }
    });
    setComments(tree);
  };

  useEffect(() => { fetchComments(); }, [projectId]);

  const handleSubmit = async (e: React.FormEvent, parentId: number | null = null) => {
    e.preventDefault();
  
    const finalContent = parentId ? replyContent : content;
    const finalAuthor = isAdmin ? "관리자" : (parentId ? replyAuthor : author);
    const finalPassword = isAdmin ? "admin-pass" : (parentId ? replyPassword : password);
  
    if (!finalContent.trim()) return alert("내용을 입력해주세요.");
    if (!isAdmin && (!finalAuthor.trim() || !finalPassword.trim())) {
      return alert("닉네임과 비밀번호를 입력해주세요.");
    }
  
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: "POST",
      body: JSON.stringify({ 
        author: finalAuthor, 
        password: finalPassword, 
        content: finalContent,
        parentId: parentId 
      }),
    });
  
    if (res.ok) {
      if (parentId) {
        setReplyContent(""); setReplyAuthor(""); setReplyPassword(""); setReplyingTo(null);
      } else {
        setAuthor(""); setPassword(""); setContent("");
      }
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: number) => {
    let inputPwd = "";
    if (!isAdmin) {
      const pwd = prompt("삭제 비밀번호를 입력하세요.");
      if (!pwd) return;
      inputPwd = pwd;
    } else {
      if (!confirm("관리자 권한으로 삭제하시겠습니까?")) return;
    }

    const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: inputPwd }),
    });

    if (res.ok) fetchComments();
    else alert("비밀번호가 틀렸습니다.");
  };

  return (
    <section className="mt-20 border-t border-gray-100 dark:border-zinc-800 pt-16">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="text-zinc-900 dark:text-zinc-100" size={24} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          Comments
          {totalCount > 0 && (
            <span className="text-zinc-500 ml-2 text-xl">({totalCount})</span>
          )}
        </h2>
      </div>

      {/* 메인 댓글 작성 폼 */}
      <form onSubmit={(e) => handleSubmit(e, null)} className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl p-6 mb-12 border border-transparent dark:border-zinc-800">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={16} />
            <input 
              type="text" value={isAdmin ? "관리자" : author} 
              disabled={isAdmin}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="닉네임" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border-0 rounded-xl outline-none focus:ring-2 focus:ring-zinc-500 text-sm text-zinc-900 dark:text-zinc-100 disabled:text-zinc-500 dark:disabled:text-zinc-400"
            />
          </div>
          {!isAdmin && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={16} />
              <input 
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="삭제 비밀번호" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-800 border-0 rounded-xl outline-none focus:ring-2 focus:ring-zinc-500 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}
        </div>
        <textarea 
          value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="따뜻한 댓글을 남겨주세요."
          className="w-full p-4 bg-white dark:bg-zinc-800 border-0 rounded-xl outline-none focus:ring-2 focus:ring-zinc-500 text-sm text-zinc-900 dark:text-zinc-100 min-h-[100px] mb-4 resize-none"
        />
        <div className="flex justify-end">
          <button disabled={loading} className="bg-black dark:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 dark:hover:bg-white transition-all">
            등록하기
          </button>
        </div>
      </form>

      {/* 댓글 리스트 */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className={`group p-5 transition-all ${Number(comment.isAdmin) === 1 ? "bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700" : "border-b border-gray-50 dark:border-zinc-800"}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-bold text-sm ${Number(comment.isAdmin) === 1 ? "text-zinc-900 dark:text-zinc-100" : "text-gray-900 dark:text-zinc-200"}`}>{comment.author}</span>
                    {Number(comment.isAdmin) === 1 && <span className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">ADMIN</span>}
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${Number(comment.isAdmin) === 1 ? "text-zinc-700 dark:text-zinc-300" : "text-gray-600 dark:text-zinc-400"}`}>{comment.content}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-xs text-gray-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium">답글</button>
                  <button onClick={() => handleDelete(comment.id)} className="text-gray-400 dark:text-zinc-600 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              
              {replyingTo === comment.id && (
                <div className="mt-4 bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-700 shadow-sm space-y-3">
                  {!isAdmin && (
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)}
                        placeholder="닉네임" className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl outline-none text-xs border border-gray-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500"
                      />
                      <input 
                        type="password" value={replyPassword} onChange={(e) => setReplyPassword(e.target.value)}
                        placeholder="비밀번호" className="p-2.5 bg-gray-50 dark:bg-zinc-900 rounded-xl outline-none text-xs border border-gray-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-500"
                      />
                    </div>
                  )}
                  <textarea 
                    value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={isAdmin ? "관리자 답글을 남겨주세요." : "답글을 남겨주세요."}
                    className="w-full p-3 text-sm outline-none resize-none min-h-[80px] bg-gray-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 dark:text-zinc-500">취소</button>
                    <button 
                      onClick={(e) => handleSubmit(e, comment.id)} 
                      disabled={loading}
                      className="text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-4 py-2 rounded-xl font-bold hover:bg-zinc-700 dark:hover:bg-white transition-colors"
                    >
                      답글 등록
                    </button>
                  </div>
                </div>
              )}
            </div>

            {comment.children && comment.children.map((child: any) => (
              <div key={child.id} className="flex gap-3 ml-10 group">
                <CornerDownRight className="text-gray-300 dark:text-zinc-700 mt-2 flex-shrink-0" size={16} />
                <div className={`flex-1 p-4 rounded-2xl transition-all ${Number(child.isAdmin) === 1 ? "bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800" : "bg-gray-50/50 dark:bg-zinc-900/30"}`}>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-xs ${Number(child.isAdmin) === 1 ? "text-zinc-900 dark:text-zinc-100" : "text-gray-900 dark:text-zinc-200"}`}>{child.author}</span>
                      {Number(child.isAdmin) === 1 && <span className="text-[9px] bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-950 px-1.5 py-0.5 rounded font-bold uppercase">ADMIN</span>}
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{new Date(child.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => handleDelete(child.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                  <p className={`text-sm ${Number(child.isAdmin) === 1 ? "text-zinc-700 dark:text-zinc-300" : "text-gray-600 dark:text-zinc-400"}`}>{child.content}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
        {comments.length === 0 && <p className="text-center text-gray-400 dark:text-zinc-600 py-10 text-sm">첫 번째 댓글을 남겨주세요!</p>}
      </div>
    </section>
  );
}