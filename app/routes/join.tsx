import { type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Retroflect - Join retro" },
    { name: "description", content: "Join an existing retro board" },
  ];
}

export default function Join() {
  return (
    <div className="flex h-screen flex-col">
      <h1>Join Retro board</h1>
    </div>
  )
}