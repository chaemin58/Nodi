export default async function NodiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <div>모임 상세 페이지 입니다. {id}</div>;
}
