export function MyNodiTitle({ name }: { name: string }) {
  return (
    <div className="font-semibold md:text-2xl">
      <span>{name} </span>
      님의 Nodi 모음
    </div>
  );
}
