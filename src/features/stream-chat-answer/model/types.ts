export type roleType = "user" | "assistant";

export interface MessageInterface {
  status: "pending" | "streaming" | "done" | "error";
  role: roleType;
  content: string;
}
