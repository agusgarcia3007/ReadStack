import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catchAxiosError } from "@/lib/utils";
import { UsersService } from "./service";
import type { UpdateProfileData } from "@/types/users";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => UsersService.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: catchAxiosError,
  });
};