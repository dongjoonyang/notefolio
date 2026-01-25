// app/(user)/projects/[id]/page.tsx
import AllPostsPage from "@/app/(user)/all/page";
import ProjectModalPage from "@/app/(user)/@modal/(.)projects/[id]/page";
import ViewCounter from "@/components/ViewCounter"; // 💡 조회수 추적 컴포넌트 추가

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <>
      {/* 💡 사용자가 이 페이지에 들어오면 서버에 POST 요청을 보냅니다 */}
      <ViewCounter id={params.id} /> 
      
      <AllPostsPage />
      <ProjectModalPage params={Promise.resolve(params)} />
    </>
  );
}