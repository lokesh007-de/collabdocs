import EditorWorkspace from "@/components/EditorWorkspace";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditorWorkspace docId={id} />;
}
