"use client"
import axios from 'axios';
import { useState } from "react"
import Link from "next/link"
import { Loader2 , ImagePlus, Shuffle, Sparkles, Router } from "lucide-react"
import { useRouter } from 'next/navigation';


const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=faces",
]

export default function CreateAgent() {

  const [avatarIndex, setAvatarIndex] = useState(0)
  const [name , setName] = useState("");
  const [avatarSeed , setAvatarSeed] = useState<String>();
  const avatarImage = "";
  const [isLoading , setIsLoading] = useState(false);
  const [description , setDescription] = useState('');
  const router = useRouter();

  const onCLickCreateAgent = async (e:any) => {
    e.preventDefault();
    setIsLoading(true);
    try{
     const newAgentId = crypto.randomUUID();
  const result = await axios.post('/api/agent' , {
    name : name ,
    description : description , 
    agentImage : avatarImage , 
    agentId : newAgentId
  });
  console.log(result.data);
  router.push('/workspace/' + newAgentId);
  setIsLoading(false);
  }catch(e){
setIsLoading(false);
console.log("error message : " , e)
  }}

  function shuffleAvatar() {
    setAvatarIndex((current) => (current + 1 + Math.floor(Math.random() * (avatars.length - 1))) % avatars.length)
  }



  return (
    <div className="min-h-dvh bg-zinc-50 px-4 py-5 sm:px-8 sm:py-7">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-5">
          <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            <Sparkles className="size-4" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Create New Agent</h1>
          <p className="mt-1 max-w-xl text-sm leading-5 text-zinc-500">
            Set up your AI agent by choosing an avatar, name, and description. You can configure its tools and behavior later.
          </p>
        </header>

        <form className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6" onSubmit={(event) => event.preventDefault()}>
          <section className="mb-5 flex flex-col items-center border-b border-zinc-100 pb-5" aria-label="Agent avatar">
            <div className="relative mb-2.5 flex size-20 items-center justify-center overflow-hidden rounded-full bg-violet-50 ring-4 ring-violet-50 sm:size-24">
              <img src={avatars[avatarIndex]} alt="Selected agent avatar" className="size-full object-cover" />
              <span className="absolute bottom-0.5 right-0.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-white text-violet-600 shadow-sm">
                <ImagePlus className="size-3.5" />
              </span>
            </div>
            <p className="mb-2 text-sm font-medium text-zinc-800">Choose an agent avatar</p>
            <button
              type="button"
              onClick={shuffleAvatar}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <Shuffle className="size-4 text-zinc-500" />
              Shuffle image
            </button>
          </section>

          <div className="space-y-4">
            <div>
              <label htmlFor="agent-name" className="mb-1.5 block text-sm font-medium text-zinc-800">Agent Name</label>
              <input
                id="agent-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Research Assistant"
                onChange={(event) => setName(event.target.value) }
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label htmlFor="agent-description" className="text-sm font-medium text-zinc-800">Agent Description</label>
                <span className="text-xs text-zinc-400">Optional</span>
              </div>
              <textarea
                id="agent-description"
                name="description"
                rows={3}
                placeholder="Describe what this agent will help you with..."
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-20 w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-5 text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
            <Link
              href="/workspace"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
              onClick={onCLickCreateAgent}
              disabled = {isLoading}
            >
              {isLoading?<Loader2 className = "animate-spin"/>:null}
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
