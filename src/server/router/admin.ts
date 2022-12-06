import { createRouter } from "./context";
import { z } from "zod";

export const adminRouter = createRouter().query("fetchEvents",{async resolve({ctx}){
  const events = await ctx.prisma.event.findMany({});
  if(events){
    return {events}
  }else{
    return{status:"error fetching events"}
  }
}}).mutation("verifyEvent",{input:z.object({eventName:z.string()}),async resolve({ctx,input}){
  const updatedEvent = await ctx.prisma.event.update({where:{EventName:input.eventName},data:{EventValidity:true}});
  if(updatedEvent.EventValidity == true){
    return{
      status:"event verified"
    }
  }else{
    return{
      status:"event not verified"
    }
  }
}})
