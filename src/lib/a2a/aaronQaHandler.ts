import { TaskHandler, TaskContext, TaskYieldUpdate} from '@/lib/a2aServerMod/server/handler';;
import { MessageData } from "genkit";
import * as schema from '@/lib/a2aServerMod/schema'; // Adjust import path
import { simpleSearchFlow } from '@/lib/genkit/flows/simpleSearchFlow';

/**
 * Task Handler for the Movie Agent.
 */
export async function* movieAgentHandler(
    context: TaskContext
  ): AsyncGenerator<TaskYieldUpdate> {
    console.log(
      `[MovieAgent] Processing task ${context.task.id} with state ${context.task.status.state}`
    );
  
    // Yield an initial "working" status
    yield {
      state: "working",
      message: {
        role: "agent",
        parts: [{ type:"text", text: "Processing your question, hang tight!" }],
      },
    };
  
    // Prepare messages for Genkit prompt using the full history from context
    const messages: MessageData[] = (context.history ?? []) // Use history if available, default to empty array
      .map((m) => ({
        // Map roles explicitly and assert the type for Genkit
        role: (m.role === "agent" ? "model" : "user") as "user" | "model",
        content: m.parts
          .filter((p): p is schema.TextPart => !!(p as schema.TextPart).text) // Filter for text parts
          .map((p) => ({
            text: p.text,
          })),
      }))
      // Filter out messages with no text content after mapping
      .filter((m) => m.content.length > 0);
  
    // Add a check in case history was empty or only contained non-text parts
    if (messages.length === 0) {
      console.warn(
        `[MovieAgent] No valid text messages found in history for task ${context.task.id}. Cannot proceed.`
      );
      yield {
        state: "failed",
        message: {
          role: "agent",
          parts: [{ type:"text", text: "No message found to process." }],
        },
      };
      return; // Stop processing
    }
  
    // Include the goal from the initial task metadata if available
    // const goal = context.task.metadata?.goal as string | undefined;

    const goal = "How does one named a2a shall get started with connecting agents running on gcp?"
  
    try {
      // Run the Genkit prompt
      const response = await simpleSearchFlow(
        goal, // Pass goal from metadata
      );
  
      const responseText = response.summary; // Access the text property directly
      const lines = responseText.trim().split("\n");
      const finalStateLine = lines.at(-1)?.trim().toUpperCase(); // Get last line, uppercase for robust comparison
      const agentReply = lines
        .slice(0, lines.length - 1)
        .join("\n")
        .trim(); // Get all lines except the last
  
      let finalState: schema.TaskState = "unknown";
  
      // Map prompt output instruction to A2A TaskState
      if (finalStateLine === "COMPLETED") {
        finalState = "completed";
      } else if (finalStateLine === "AWAITING_USER_INPUT") {
        finalState = "input-required";
      } else {
        console.warn(
          `[MovieAgent] Unexpected final state line from prompt: ${finalStateLine}. Defaulting to 'completed'.`
        );
        // If the LLM didn't follow instructions, default to completed
        finalState = "completed";
      }
  
      // Yield the final result
      yield {
        state: finalState,
        message: {
          role: "agent",
          parts: [{ type: "text", text: agentReply }],
        },
      };
  
      console.log(
        `[MovieAgent] Task ${context.task.id} finished with state: ${finalState}`
      );
    } catch (error: any) {
      console.error(
        `[MovieAgent] Error processing task ${context.task.id}:`,
        error
      );
      // Yield a failed state if the prompt execution fails
      yield {
        state: "failed",
        message: {
          role: "agent",
          parts: [{ type: "text", text: `Agent error: ${error.message}` }],
        },
      };
    }
  }