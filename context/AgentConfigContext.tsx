import { createContext, type Dispatch, type SetStateAction } from "react";
import type { AgentConfigType } from "@/type/Agent";

type AgentConfigContextValue = {
  agentConfig: AgentConfigType | undefined
  setAgentConfig: Dispatch<SetStateAction<AgentConfigType | undefined>>
}

export const AgentConfigContext = createContext<AgentConfigContextValue | null>(null)
