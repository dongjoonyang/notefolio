"use client";

import { useState, useEffect } from "react";
import { MessageSquare, User, Lock, Trash2, CornerDownRight, Edit2 } from "lucide-react";

export default function CommentSection({ projectId, isAdmin }: { projectId: string; isAdmin: boolean }) {
  const [comments, setComments] = useState<any[]>([]);
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 답글 전용 상태
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null); 

  const [totalCount, setTotalCount] = useState(0); 

  // 수정을 위한 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

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
  
    // 답글일 때와 일반 댓글일 때의 상태값을 구분해서 가져옴
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
      headers: { "Content-Type": "application/json" },
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

  const handleUpdate = async (commentId: number) => {
    if (!editContent.trim()) return alert("내용을 입력해주세요.");
    
    const pwd = isAdmin ? "admin-pass" : prompt("수정 비밀번호를 입력하세요.");
    if (!pwd) return;

    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent, password: pwd }),
    });

    if (res.ok) {
      setEditingId(null);
      fetchComments();
    } else {
      alert("비밀번호가 틀렸습니다.");
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
    <section className="border-gray-100 dark:border-zinc-800 pt-8">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          댓글
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

      {/* 댓글 목록 */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className={`group p-5 transition-all ${Number(comment.isAdmin) === 1 ? "bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700" : "border-b border-gray-50 dark:border-zinc-800"}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`font-bold text-sm ${Number(comment.isAdmin) === 1 ? "text-zinc-900 dark:text-zinc-100" : "text-gray-900 dark:text-zinc-200"}`}>{comment.author}</span>
                    {Number(comment.isAdmin) === 1 && <span className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">ADMIN</span>}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 dark:text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      {Number(comment.isUpdated) === 1 && <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">(수정됨)</span>}
                    </div>
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-3 text-sm bg-white dark:bg-zinc-800 border rounded-xl outline-none focus:ring-2 focus:ring-zinc-500 dark:text-zinc-100 min-h-[80px] resize-none" />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">취소</button>
                        <button onClick={() => handleUpdate(comment.id)} className="text-xs font-bold text-zinc-900 dark:text-zinc-100">저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm leading-relaxed ${Number(comment.isAdmin) === 1 ? "text-zinc-700 dark:text-zinc-300" : "text-gray-600 dark:text-zinc-400"}`}>{comment.content}</p>
                  )}
                </div>
                <div className="flex gap-4 items-center opacity-100 transition-all ml-4">
                  <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-xs text-gray-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 font-bold uppercase tracking-tighter">답글</button>
                  {((isAdmin && Number(comment.isAdmin) === 1) || (!isAdmin && Number(comment.isAdmin) === 0)) && (
                    <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="text-gray-400 hover:text-zinc-900"><Edit2 size={16} /></button>
                  )}
                  {(isAdmin || Number(comment.isAdmin) === 0) && (
                    <button onClick={() => handleDelete(comment.id)} className="text-gray-400 dark:text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  )}
                </div>
              </div>
            </div>

            {/* 💡 답글 작성 폼 (답글 버튼 클릭 시 노출) */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmit(e, comment.id)} className="ml-10 bg-gray-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                {!isAdmin && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input 
                      type="text" placeholder="닉네임" value={replyAuthor} 
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      className="p-2 text-xs bg-white dark:bg-zinc-800 rounded-lg outline-none border dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" 
                    />
                    <input 
                      type="password" placeholder="비밀번호" value={replyPassword} 
                      onChange={(e) => setReplyPassword(e.target.value)}
                      className="p-2 text-xs bg-white dark:bg-zinc-800 rounded-lg outline-none border dark:border-zinc-700 text-zinc-900 dark:text-zinc-100" 
                    />
                  </div>
                )}
                <textarea 
                  placeholder="답글을 남겨주세요." value={replyContent} 
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-zinc-800 rounded-lg outline-none border dark:border-zinc-700 resize-none min-h-[60px] text-zinc-900 dark:text-zinc-100" 
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setReplyingTo(null)} className="text-xs text-gray-400">취소</button>
                  <button type="submit" disabled={loading} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold">답글 등록</button>
                </div>
              </form>
            )}

            {/* 자식 댓글 목록 */}
            {comment.children && comment.children.map((child: any) => (
              <div key={child.id} className="flex gap-3 ml-6 md:ml-10 group">
                <CornerDownRight className="text-gray-300 dark:text-zinc-700 mt-2 flex-shrink-0" size={16} />
                <div className={`flex-1 p-4 rounded-2xl transition-all ${Number(child.isAdmin) === 1 ? "bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800" : "bg-gray-50/50 dark:bg-zinc-900/30"}`}>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-xs ${Number(child.isAdmin) === 1 ? "text-zinc-900 dark:text-zinc-100" : "text-gray-900 dark:text-zinc-200"}`}>{child.author}</span>
                      {Number(child.isAdmin) === 1 && <span className="text-[9px] bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-950 px-1.5 py-0.5 rounded font-bold uppercase">ADMIN</span>}
                      <span className="text-[10px] text-gray-400 dark:text-zinc-500">{new Date(child.createdAt).toLocaleDateString()}</span>
                      {Number(child.isUpdated) === 1 && <span className="text-[9px] text-gray-400 font-medium">(수정됨)</span>}
                    </div>
                    <div className="flex gap-3 items-center">
                      {((isAdmin && Number(child.isAdmin) === 1) || (!isAdmin && Number(child.isAdmin) === 0)) && (
                        <button onClick={() => { setEditingId(child.id); setEditContent(child.content); }} className="text-gray-400 hover:text-zinc-900"><Edit2 size={14} /></button>
                      )}
                      {(isAdmin || Number(child.isAdmin) === 0) && (
                        <button onClick={() => handleDelete(child.id)} className="opacity-100 text-gray-400 dark:text-zinc-600 hover:text-red-500 transition-all p-1"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </div>
                  {editingId === child.id ? (
                    <div className="mt-2">
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-zinc-800 border rounded-lg dark:text-zinc-100 outline-none resize-none" />
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={() => setEditingId(null)} className="text-[10px] text-gray-400">취소</button>
                        <button onClick={() => handleUpdate(child.id)} className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100">저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${Number(child.isAdmin) === 1 ? "text-zinc-700 dark:text-zinc-300" : "text-gray-600 dark:text-zinc-400"}`}>{child.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}