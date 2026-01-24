// app/(user)/projects/[id]/page.tsx
import AllPostsPage from "@/app/(user)/all/page"; // 💡 상대경로 대신 @를 사용한 절대경로 시도
import ProjectModalPage from "@/app/(user)/@modal/(.)projects/[id]/page";

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <>
      <AllPostsPage />
      <ProjectModalPage params={Promise.resolve(params)} />
    </>
  );
}