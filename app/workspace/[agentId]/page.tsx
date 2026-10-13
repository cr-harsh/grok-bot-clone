"use client"
import AgentChat from "@/components/custom/agentspace/AgentChat"
import AgentConfigSidebar from "@/components/custom/agentspace/AgentConfigSidebar"
import { useParams } from "next/navigation"
import axios from 'axios';
import { useEffect, useState } from "react";
import { AgentConfigType } from "@/type/Agent";
import { AgentConfigContext } from "@/context/AgentConfigContext";

export default function AgentSpace() {

  const {agentId} = useParams();
  const [agentConfig , setAgentConfig] = useState<AgentConfigType>();
  
  useEffect(() => {
    agentId && GetAgentConfig()
  },[agentId])

  const GetAgentConfig = async () => {
  const result = await axios.get('/api/agent?agentId=' + agentId)
  console.log(result.data)
  setAgentConfig(result.data);
 }
  return (
    <AgentConfigContext.Provider value={{agentConfig , setAgentConfig}}>
    <div className="flex h-dvh min-w-0 bg-zinc-50 text-zinc-900">
      <AgentChat />
      <AgentConfigSidebar />
    </div>
    </AgentConfigContext.Provider>
  )
}
