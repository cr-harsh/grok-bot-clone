import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { AgentConfig , db , users} from "@/db";
import { eq , desc} from "drizzle-orm"; 

export async function POST(req : NextRequest){
  const { agentId , name , description , agentImage } = await req.json();
  const session = await getServerSession(authOptions);

  if(!session?.user?.email){
    return NextResponse.json({error : "Unauthorized"} , {status : 401})
  }

  // Ensure the referenced user exists before inserting the agent configuration.
  await db.insert(users).values({
    name: session.user.name,
    email: session.user.email,
  }).onConflictDoNothing({ target: users.email });

  //Insert the new agent configeration into the database
  const newAgentConfig = await db.insert(AgentConfig).values({
    agentId : agentId, name , description , agentImage , userEmail : session.user.email
  }).returning();

  return NextResponse.json({message : "Agent configeration saved successfully" , AgentConfig : newAgentConfig});

}

export async function GET(req : NextRequest){
  const session = await getServerSession(authOptions);

  if(!session?.user?.email){
    return NextResponse.json({ error : "Unauthorized"} , {status : 401})
  }

  //fetch all agent configerations for the logged in user
  const agentConfigs = await db.select().from(AgentConfig).where(eq(AgentConfig.userEmail , session.user.email)).orderBy(desc(AgentConfig.createdAt));

  return NextResponse.json(agentConfigs);
}
