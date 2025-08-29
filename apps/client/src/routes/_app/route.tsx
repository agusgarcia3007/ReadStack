import { LS_AUTH_KEYS } from "@/lib/constants";
import { createFileRoute, redirect } from "@tanstack/react-router";

const { TOKEN } = LS_AUTH_KEYS;

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem(TOKEN);
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
