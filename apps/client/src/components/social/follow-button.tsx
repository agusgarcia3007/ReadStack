import { Button } from "@/components/ui/button";
import { useFollowUser, useUnfollowUser } from "@/services/social/mutations";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function FollowButton({ 
  userId, 
  isFollowing, 
  variant = "default",
  size = "default",
  className 
}: FollowButtonProps) {
  const { isPending: isFollowPending, mutate: followUser } = useFollowUser();
  const { isPending: isUnfollowPending, mutate: unfollowUser } = useUnfollowUser();

  const handleClick = () => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser({ userId });
    }
  };

  const isLoading = isFollowPending || isUnfollowPending;

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      isLoading={isLoading}
      className={className}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}