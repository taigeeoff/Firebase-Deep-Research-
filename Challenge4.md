# Challenge 4: Advanced RAG for Email Report Generation  📧

## Introduction

Welcome to the most complex challenge yet! You'll transform a simple RAG system into a sophisticated multi-step pipeline using Genkit. Your mission is to build an AI assistant that can:

1. Extract technical questions from customer call transcripts
2. Research answers for each question individually using your knowledge base
3. Generate professional follow-up emails based on the research results


## Step 0: Designing an email generation chain

This time, before diving into the codebase please take a step back and think about how you would design a multi-step pipeline for generating professional follow-up emails (based on the solution we implemented so far).

Assume that the starting point for each follow up email is a customer call transcript or your meeting notes. The goal of each follow up email should be to answer all questions that you were not able to answer during the meeting. It's crucial for your follow up answer to be deeply in factual knowlede and not hallucinate on technical details.

Consider the following aspects:

### Pipeline Components
1. **Transcript Analysis**
   - How will you extract technical questions from customer transcripts?
   - What key information needs to be identified? (e.g., customer pain points, specific technical issues)
   - How will you maintain the context of the conversation?

2. **Knowledge Base Research**
   - How will you formulate search queries from the extracted questions?
   - What strategy will you use to retrieve relevant information?
   - How will you handle multiple sources or potentially conflicting information?

3. **Email Generation**
   - What components should the email include? (e.g., greeting, summary, detailed answers, next steps)
   - How will you maintain a professional tone while being technically accurate?
   - How will you cite or reference the sources used?

Take some time to sketch out your pipeline design before proceeding. This planning phase will help you better understand the implementation requirements and potential challenges.

## Understanding the Codebase
Let's explore the key components that power this advanced RAG system using Genkit:

### 1. Query UI (`src/app/query/page.tsx`)
- The user interface for submitting a customer transcript.
- Displays the extracted technical questions (tasks).
- Shows the research results for each question.
- Presents the final generated follow-up email.

### 2. Genkit Prompts (`src/lib/genkit/prompts/`)
- **`taskExtraction.prompt`**: Defines the instructions for the AI model to analyze a transcript and extract the core technical questions or tasks that need follow-up. It specifies the desired JSON output format for the tasks.
- **`taskResearch.prompt`**: Contains the instructions for the AI model to research a single technical task. It guides the model to use the provided documentation context (retrieved from the vector store) to generate a clear answer, note caveats, and reference the source documents.
- **`emailGeneration.prompt`**: Provides the template and instructions for generating the final professional follow-up email. It tells the AI model how to structure the email, incorporate the research findings for each task, maintain the correct tone, and include necessary components like greetings and next steps, using the extracted tasks and research results as input.

### 3. Genkit Flow (`src/lib/genkit/flows/transcriptToEmailFlow.ts`)
- This TypeScript file orchestrates the entire multi-step process using Genkit's flow capabilities.
- It defines several flows:
    - **`taskExtractionFlow`**: Takes the raw transcript and uses the `taskExtraction.prompt` to extract tasks.
    - **`taskReseachFlow`**: Takes the extracted tasks, retrieves relevant documents from the Firestore vector store (`simpleFirestoreVSRetriever`) for each task, and then uses the `taskResearch.prompt` in parallel to generate research answers for every task based on the retrieved documents.
    - **`emailAggregationFlow`**: Takes the original tasks and the generated research results, then uses the `emailGeneration.prompt` to compose the final email.
    - **`transcriptToEmailFlow`**: The main orchestrator flow that ties everything together. It takes the transcript as input, calls the `taskExtractionFlow`, then the `taskReseachFlow`, and finally the `emailAggregationFlow` to produce the final output containing the tasks, research, and the generated email.
- It utilizes Genkit features like `ai.defineFlow`, `ai.prompt`, `ai.retrieve`, schema definition with `zod`, and integration with Vertex AI models and Firestore retrievers configured via `genkitFactory.ts`.

## Step 1: Write the Genkit Prompts ✍️

Before implementing the flows, you need to create the `.prompt` files that will guide the AI models at each stage. Create the following files in the `src/lib/genkit/prompts/` directory:

1.  **`taskExtraction.prompt`**:
    *   **Goal:** Analyze the input transcript and extract specific technical questions or tasks that require follow-up.
    *   **Input:** `transcript` (string)
    *   **Output:** A JSON array where each object has a `description` field containing the extracted question.
    *   **Instructions:** Clearly instruct the model to identify unanswered technical questions, focus on specifics, and ignore general conversation or already answered points. Define the JSON output structure.

2.  **`taskResearch.prompt`**:
    *   **Goal:** Research a single technical task using provided documentation context.
    *   **Input:** `task` (string), `context` (documentation snippets from retrieval)
    *   **Output:** A JSON object containing `answer`, `caveats` (array of strings), and `docReferences` (array of objects with `title`, `url`, `relevantContent`).
    *   **Instructions:** Guide the model to synthesize an answer based *only* on the provided `context`, identify potential caveats or important notes, and list the source document sections used.

3.  **`emailGeneration.prompt`**:
    *   **Goal:** Generate a professional follow-up email summarizing the research findings.
    *   **Input:** `tasks` (JSON string of extracted tasks), `research` (JSON string of research results for all tasks)
    *   **Output:** A JSON object with an `email` field containing the full email text.
    *   **Instructions:** Provide a template for the email structure (greeting, summary, detailed answers per task referencing the research, next steps). Emphasize a professional and concise tone, referencing the provided `tasks` and `research`. Include an example of the desired email style and conciseness.

### Your Task: 
Write the required prompt templates.

**Hints:**
*   Use the `.prompt` file format, including `config` (e.g., temperature), `input`, and `output` schema definitions where applicable.
*   Refer to the Genkit documentation on [Managing Prompts](https://firebase.google.com/docs/genkit/dotprompt) and general prompt design principles.
*   Test your prompts iteratively, perhaps using the Genkit Developer UI or the [Vertex AI Studio](https://console.cloud.google.com/vertex-ai/studio/freeform).


## Step 2: TaskExtraction Flow
In the Genkit implementation, the email generation is split into distinct flows:
1. **Task Extraction Flow (`taskExtractionFlow`)**
2. **Research Flow (`taskReseachFlow`)**
3. **Email Generation Flow (`emailAggregationFlow`)**

The `taskExtractionFlow` is the first crucial component. Its purpose is to analyze a customer transcript and identify specific technical questions or tasks using the `taskExtraction.prompt`.
Technocally this is creating a research plan to be processed by the further workflow.

### Flow Requirements
The flow should:
1. Take a transcript string as input.
2. Use the AI model configured in `genkitFactory.ts` and the `taskExtraction.prompt`.
3. Output a structured array of tasks according to the `TaskArraySchema`.

### Expected Input/Output

**Input Example (string):**
```
Customer: We're thinking about implementing Cloud Run, but I'm concerned about the cold start times.
Also, how does the pricing work when we have multiple revisions deployed?

Agent: Those are great questions. Let me look into those details for you and include them in my follow-up email.
```

**Expected Output Example (TaskArraySchema):**
```typescript
[
  {
    description: "What are the strategies to minimize cold start times in Cloud Run?"
  },
  {
    description: "How does Cloud Run pricing work with multiple revisions deployed?"
  }
]
```

### Implementation Details (Genkit)
The `taskExtractionFlow` in `src/lib/genkit/flows/transcriptToEmailFlow.ts` implements this using:

- **An input schema:** `z.string()`
- **An output schema:** `TaskArraySchema`
- **A prompt reference:** `ai.prompt('taskExtraction')`
- **An AI model call:** `taskExtractionPrompt(...)` specifying the model and output schema.

### Your Task:
Define the task extraction Genkit flow inluding required input & output schemas. You can review the [Genkit documentation for some syntax support](https://firebase.google.com/docs/genkit/flows).


## Step 3: Flow Orchestration
Consider the main `transcriptToEmailFlow` method in `src/lib/genkit/flows/transcriptToEmailFlow.ts`. This flow orchestrates the sequence:

1.  Call `taskExtractionFlow` with the transcript.
2.  Call `taskReseachFlow` with the result of `taskExtractionFlow`.
3.  Call `emailAggregationFlow` with the results of the previous two flows.
4.  Return the combined results (tasks, research, email).

### Your Task: 
Fix the missing pieces in the `transcriptToEmailFlow` to complete the transcript to email LLM workflow.

## Next Steps
Congratulations you finished challenge 4. On to the next one ...
