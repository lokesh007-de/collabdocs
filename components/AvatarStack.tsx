type Avatar = {
  name: string;
  initials: string;
  color: string;
};

export default function AvatarStack({
  avatars = [],
  limit = 4,
}: {
  avatars?: Avatar[];
  limit?: number;
}) {
  const safeList = avatars || [];
  const visible = safeList.slice(0, limit);

  return (
    <div className="flex items-center -space-x-2" aria-label={`${safeList.length} collaborators`}>
      {visible.map((avatar, index) => (
        <span
          key={`${avatar.name}-${index}`}
          title={avatar.name}
          className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-xs"
          style={{ backgroundColor: avatar.color }}
        >
          {avatar.initials}
        </span>
      ))}
      {safeList.length > limit && (
        <span className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border-2 border-white bg-primary-fixed text-[10px] font-bold text-primary shadow-xs">
          +{safeList.length - limit}
        </span>
      )}
    </div>
  );
}
