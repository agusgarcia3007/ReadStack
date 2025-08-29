import { createFileRoute, redirect } from "@tanstack/react-router";
import { LS_AUTH_KEYS } from "@/lib/constants";

const { TOKEN } = LS_AUTH_KEYS;

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const token = localStorage.getItem(TOKEN);
    if (token) {
      throw redirect({
        to: "/feed",
      });
    }
  },
  component: Index,
});

function Index() {
  return <>Hello World!</>;
}
