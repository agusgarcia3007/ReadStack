import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFollowUser, useUnfollowUser } from "@/services/social/mutations";
import type { User } from "@/types/users";
import { CheckCircle } from "lucide-react";

interface UserCardProps {
  user: User;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  compact?: boolean;
}

export function UserCard({ 
  user, 
  isFollowing = false, 
  showFollowButton = true, 
  compact = false 
}: UserCardProps) {
  const { isPending: isFollowPending, mutate: followUser } = useFollowUser();
  const { isPending: isUnfollowPending, mutate: unfollowUser } = useUnfollowUser();

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser({ userId: user.id });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.username || "Unknown User"}
              </p>
              {user.isVerified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            {user.username && (
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            )}
          </div>
        </div>
        {showFollowButton && (
          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            onClick={handleFollowToggle}
            isLoading={isFollowPending || isUnfollowPending}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profileImage} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.name || user.username || "Unknown User"}
                </h3>
                {user.isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                )}
              </div>
              {user.username && (
                <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
              )}
              {user.bio && (
                <p className="text-sm text-gray-700 mb-3">{user.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{user.followersCount || 0} followers</span>
                <span>{user.followingCount || 0} following</span>
                {user.booksReadCount && (
                  <span>{user.booksReadCount} books read</span>
                )}
              </div>
            </div>
          </div>
          {showFollowButton && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollowToggle}
              isLoading={isFollowPending || isUnfollowPending}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}