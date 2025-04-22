# Challenge 3: Simple RAG - "The Question Answering Machine" 🤖

In this challenge, you'll implement a Retrieval-Augmented Generation (RAG) system to power accurate, context-aware answers about GCP documentation. RAG combines the power of large language models with your own knowledge base to provide more accurate, up-to-date, and relevant responses.

## Understanding RAG 🧠

Before diving in, let's understand what RAG is and why it's important:

- [Google Cloud's Guide to RAG](https://cloud.google.com/use-cases/retrieval-augmented-generation?hl=en) explains how RAG combines traditional information retrieval with generative AI
- [NVIDIA's RAG 101](https://developer.nvidia.com/blog/rag-101-demystifying-retrieval-augmented-generation-pipelines/) provides a technical deep-dive into RAG pipeline components

Key benefits of RAG:
- Provides up-to-date information from your knowledge base
- Reduces AI hallucinations through factual grounding
- Maintains data privacy by using your controlled data sources
- Enables domain-specific expertise


## Step 1: Explore the Search Codebase 🕵️‍♀️

Before implementing the search functionality, let's explore the existing codebase to understand the key components involved in the search and result display process.

### Core Components for a simple RAG Q&A implementation

1.  **Search Page (`src/app/search/page.tsx`)**:
    -   This is the page component for the semantic search feature.
    -   It integrates hooks like `useSearchSummary` to perform searches and display results.
    -   Key elements to examine:
        -   State variable `query`: Manages the user's search input.
        -   `handleSearch` function: Initiated when the user submits the search form. It calls the `performSearch` function from the `useSearchSummary` hook.
        -   Rendering logic: Displays the search results (documents) and the generated summary provided by the hook.

2.  **Search Summary Hook (`src/hooks/useSearchSummary.tsx`)**:
    -   This custom React hook encapsulates the logic for fetching the search summary and the associated documents.
    -   It manages the state for the summary, the retrieved documents, loading status, and errors.
    -   The `performSearch` function within this hook is responsible for calling the backend API (`/api/search-summary`). This API route triggers the `simpleSearchFlow`.
    -   Key elements to examine:
        -   State variables: `summary`, `documents`.
        -   `performSearch` function: Takes the user query, sends it to the backend API, receives the summary and documents, and updates the state.
        -   Error handling logic.

3.  **Search Summary Component (`src/app/components/SearchPanel/SearchSummary.tsx`)**:
    -   This component is dedicated to displaying the AI-generated summary received from the `useSearchSummary` hook.
    -   It handles different states: loading, error, and displaying the summary content.

4.  **Vector Search Action (`src/lib/actions/vectorSearchAction.ts`)**:
    -   This is a Next.js Server Action (`'use server'`) responsible for executing the core vector search logic against Firestore.
    -   It's called by the `simpleFirestoreVSRetriever`.
    -   Key elements to examine:
        -   Initialization: Sets up the Firestore client and the `EmbeddingService`.
        -   Input: Takes the user's `query` string and search `options` (like `limit`).
        -   Query Embedding: Uses the `EmbeddingService` to generate a vector embedding for the input `query`.
        -   Firestore Vector Query: Constructs and executes a `findNearest` query on the `chunks` collection using the generated `queryVector`, specifying the `vectorField`, `limit`, and `distanceMeasure`.
        -   Result Mapping: Processes the `VectorQuerySnapshot` from Firestore, extracting relevant data (`documentId`, `chunkId`, `content`, `metadata`, `score`) for each retrieved chunk and formatting it into a `SearchResult` array.
        -   Error Handling: Includes basic error handling and logging.

5.  **Simple Firestore Vector Search Retriever (`src/lib/genkit/retriever/simpleSearchRetriever.ts`)**:
    -   This file defines a custom Genkit retriever (`simpleFirestoreVSRetriever`).
    -   It uses Genkit's `ai.defineSimpleRetriever` to integrate the vector search logic into a Genkit flow.
    -   The retriever's core logic calls the `vectorSearchAction` to perform the actual search against Firestore.
    -   It takes a query string and configuration (like `limit`) as input.
    -   It maps the `SearchResult` array returned by `vectorSearchAction` into Genkit `Document` objects, making the results usable within the Genkit ecosystem.
    -   Key elements to examine:
        -   How it uses `defineSimpleRetriever` to specify content and metadata extraction from `Document` objects (mapping from `SearchResult`).
        -   The asynchronous function that handles the retrieval logic by calling `vectorSearchAction`.
        -   The mapping of `SearchResult` to Genkit `Document` format.

6.  **Simple Search Flow (`src/lib/genkit/flows/simpleSearchFlow.ts`)**:
    -   This file defines a Genkit flow (`simpleSearchFlow`) that orchestrates the RAG process. This flow is likely invoked by the `/api/search-summary` API route called from the `useSearchSummary` hook.
    -   It uses the `ai.defineFlow` method.
    -   The flow takes a text query as input (`inputSchema: z.string()`).
    -   It defines the expected output structure, including a summary and the retrieved documents (`outputSchema`).
    -   *This is where the core RAG logic lives.*
    -   Key elements to examine:
        -   It initializes the AI instance (`createVertexAI`) and the `simpleFirestoreVSRetriever`.
        -   Inside the flow's execution function:
            -   It calls `ai.retrieve`, passing the `simpleFirestoreVSRetriever`, the user's `queryText`, and options (like `limit`). This step fetches relevant documents via the retriever (which calls `vectorSearchAction`).
            -   It loads a Genkit prompt (`qaSummary`).
            -   It calls the prompt, providing the original `queryText` (as `question`) and the retrieved `docs` as context.
            -   It returns the generated summary text and the retrieved documents.

## Step 2: Implement Query Embeddings 🧮

Query embeddings are handled within the `vectorSearchAction` called by the `simpleFirestoreVSRetriever`. Ensure that the action correctly generates embeddings for the incoming query before performing the Firestore vector search.

### Background

In [Challenge 2](Challenge2.md), we created a knowledge base by:
1. Breaking documents into chunks
2. Converting those chunks into embeddings
3. Storing them in Firestore with vector search capabilities

Now, the `vectorSearchAction` needs to convert user questions into the same vector space to find relevant chunks.

### Implementation Details

The `vectorSearchAction` should:
1. Receive the search query.
2. Generate an embedding for that query using an appropriate embedding service (e.g., `EmbeddingService` interacting with Vertex AI Text Embeddings API).
3. Use that embedding vector to perform a vector similarity search in Firestore.

### Your Task
Ensure the `vectorSearchAction` correctly implements the generation of query embeddings before executing the Firestore search.


## Step 3: Implement Vector Search 🔍

Vector search is also performed within the `vectorSearchAction`. This action needs to execute the nearest neighbor search against the Firestore collection using the generated query embedding.

### Background

To complete the search functionality, `vectorSearchAction` needs to:
1. Use the query embedding to find similar document chunks in the Firestore collection.
2. Return the most relevant results based on vector similarity.
3. Configure appropriate distance measures and query parameters (like `limit`).

You can refer to the [Firestore Vector Search Documentation](https://firebase.google.com/docs/firestore/vector-search#make_a_nearest-neighbor_query).

### Your Task
Ensure the `vectorSearchAction` correctly implements the nearest neighbor search using the Firestore client SDK and returns the relevant document data.


## Step 4: Implement Summary Generation 📝

Summary generation happens within the `simpleSearchFlow` using a Genkit prompt.

### Background

The summary generation is the final piece of our RAG pipeline within the flow. It:
1. Takes the user's question and the context retrieved by `simpleFirestoreVSRetriever`.
2. Uses a carefully crafted prompt (`qaSummary.prompt`) to guide the language model.
3. Generates a coherent, accurate response based *only* on the provided documents.
4. Should ideally include citations or references to the source documents.

### Your Task

Write the `src/lib/genkit/prompts/qaSummary.prompt` template to create effective result summaries. The prompt template requires input variables. Based on how it's called in `simpleSearchFlow` (`qaSummaryPrompt({ question: queryText }, { docs })`), identify the required variables (`question` and `docs`) and implement the prompt accordingly.

Consider:

1.  **System Role and Context**
    -   Define a clear expert persona (e.g., "You are an expert assistant specialized in Google Cloud documentation.").
    -   Instruct the model to base its answer *solely* on the provided documents (`{{docs}}`).
    -   Set expectations for response format.
    -   Specify citation requirements if needed (referencing metadata from the `docs`).

2.  **User Instruction**
    -   Clearly state the user's question (`{{question}}`).

3.  **Response Structure**
    -   Direct answer to the question based *only* on the context.
    -   Technical details and examples *from the context*.
    -   Source citations (if implemented).
    -   Instruction on what to do if the answer isn't found in the context (e.g., "If the documents do not contain the answer, state that clearly.").

### Need Help?

-   Review Genkits's [RAG Guide](https://firebase.google.com/docs/genkit/rag)
-   Consult the [Genkit Prompting Guide](https://firebase.google.com/docs/genkit/dotprompt)

## Step 5:  (Bonus Task) Review Flow Parameters & Add Logging

In the `simpleSearchFlow.ts` file, ensure the parameters passed to the `qaSummaryPrompt` (`{ question: queryText }` and `{ docs }`) match the variables defined in your `qaSummary.prompt` file.

Next, let's check out monitoring to understand the flow of information.

Run the application with:
```bash
npx genkit start -- npm run dev
```

Once the app is running visit `/search` at localhost:3000 .

That will bring you to the search interface.
1. Test with a variety of queries that require information from your knowledge base to provide accurate answers.
2. Observe the console logs to see the flow execution.
3. Experiment with the `qaSummary.prompt` based on results, to cater the result summary to your preference.

To monitor the traces of your RAG application visit "Traces" at localhost:4000.
Here you should see the simpleSearchFlow invokation including the input and output of the respective sub-steps for retrieval and generation 

**Challenge Complete!** 🎉

Congratulations! You've built a complete RAG-based Q&A system using Genkit that can:
- Perform semantic search over GCP documentation using a custom retriever.
- Generate accurate, context-aware summaries using a Genkit flow and prompt.
- Provide proper source attribution (if implemented in the prompt).
- Handle various types of technical queries.

On to the next one...!
