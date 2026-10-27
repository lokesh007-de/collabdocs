import AvatarStack from "@/components/AvatarStack";

type Collaborator = { name: string; initials: string; color: string };

export default function PresenceAvatars({
  collaborators = [],
}: {
  collaborators?: Collaborator[];
}) {
  return (
    <div className="flex items-center gap-2.5">
      <AvatarStack avatars={collaborators} limit={4} />
      <span className="text-xs font-semibold text-secondary">
        {collaborators.length} active peer{collaborators.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
