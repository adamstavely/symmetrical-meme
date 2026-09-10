# Implementation · Checkpoint

## Question: agent

### Term

agent

### Prompt

Which term matches this definition?

An AI system that can take actions on its own to accomplish a goal: it observes a situation, decides what to do, uses tools to do it, and checks the result. A chatbot answers; an agent acts.

### Options

- [x] Agent
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

An AI system that can take actions on its own to accomplish a goal: it observes a situation, decides what to do, uses tools to do it, and checks the result. A chatbot answers; an agent acts.

## Question: agentic

### Term

agentic

### Prompt

Which term matches this definition?

The design approach in which AI agents pursue multi-step goals with autonomy: planning, using tools, checking results, and adjusting along the way rather than following a fixed script. The current frontier of AI products, and where oversight questions get most serious.

### Options

- [x] Agentic AI / AI Agents
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

The design approach in which AI agents pursue multi-step goals with autonomy: planning, using tools, checking results, and adjusting along the way rather than following a fixed script. The current frontier of AI products, and where oversight questions get most serious.

## Question: api

### Term

api

### Prompt

Which term matches this definition?

The standard way software systems talk to each other. When teams “access the model via API,” they mean their applications send requests to the model over the internet and receive responses, no chatbot interface involved.

### Options

- [x] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU
- [ ] Latency vs. Throughput

### Explanation

The standard way software systems talk to each other. When teams “access the model via API,” they mean their applications send requests to the model over the internet and receive responses, no chatbot interface involved.

## Question: attention

### Term

attention

### Prompt

Which term matches this definition?

The core component of the transformer that lets a model weigh which parts of the input matter most for each part of the output, such as connecting a pronoun to the name it refers to paragraphs earlier.

### Options

- [x] Attention Mechanism
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

The core component of the transformer that lets a model weigh which parts of the input matter most for each part of the output, such as connecting a pronoun to the name it refers to paragraphs earlier.

## Question: compute

### Term

compute

### Prompt

Which term matches this definition?

Compute: the processing power required to train and run AI. GPU (graphics processing unit): the specialized chip that provides most of it. Compute is the scarce, expensive resource behind nearly every AI cost and capacity conversation.

### Options

- [x] Compute / GPU
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Latency vs. Throughput

### Explanation

Compute: the processing power required to train and run AI. GPU (graphics processing unit): the specialized chip that provides most of it. Compute is the scarce, expensive resource behind nearly every AI cost and capacity conversation.

## Question: embeddings

### Term

embeddings

### Prompt

Which term matches this definition?

Numerical representations of text (or images, or audio) that capture meaning, letting computers measure how similar two pieces of content are. The technology behind semantic search: finding documents by meaning rather than keyword.

### Options

- [x] Embeddings
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Numerical representations of text (or images, or audio) that capture meaning, letting computers measure how similar two pieces of content are. The technology behind semantic search: finding documents by meaning rather than keyword.

## Question: grounding

### Term

grounding

### Prompt

Which term matches this definition?

Connecting a model's output to verifiable sources: retrieved documents, live data, or citations. Grounded systems can show their work; ungrounded ones rely on training memory. Grounding is the primary defense against hallucination.

### Options

- [x] Grounding
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Connecting a model's output to verifiable sources: retrieved documents, live data, or citations. Grounded systems can show their work; ungrounded ones rely on training memory. Grounding is the primary defense against hallucination.

## Question: inference

### Term

inference

### Prompt

Which term matches this definition?

Running a trained model to produce output: every question answered, every document summarized. Training happens once; inference happens every time anyone uses the model, which is why inference costs dominate budgets at scale.

### Options

- [x] Inference
- [ ] API (Application Programming Interface)
- [ ] Compute / GPU
- [ ] Latency vs. Throughput

### Explanation

Running a trained model to produce output: every question answered, every document summarized. Training happens once; inference happens every time anyone uses the model, which is why inference costs dominate budgets at scale.

## Question: latency

### Term

latency

### Prompt

Which term matches this definition?

Latency: how long one request takes to get a response. Throughput: how many requests a system can handle over time. Interactive tools need low latency; batch processing needs high throughput; architectures optimize for one or the other.

### Options

- [x] Latency vs. Throughput
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Latency: how long one request takes to get a response. Throughput: how many requests a system can handle over time. Interactive tools need low latency; batch processing needs high throughput; architectures optimize for one or the other.

## Question: mcp-gateway

### Term

mcp-gateway

### Prompt

Which term matches this definition?

A centralized control point that sits between AI models and many MCP servers, enforcing authentication, permissions, logging, and security policy in one place instead of per connection.

### Options

- [x] MCP Gateway
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

A centralized control point that sits between AI models and many MCP servers, enforcing authentication, permissions, logging, and security policy in one place instead of per connection.

## Question: mcp-registry

### Term

mcp-registry

### Prompt

Which term matches this definition?

A catalog where MCP servers are published and discovered, letting organizations and tools find available connections rather than building or hunting for them one by one.

### Options

- [x] MCP Registry
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

A catalog where MCP servers are published and discovered, letting organizations and tools find available connections rather than building or hunting for them one by one.

## Question: mcp-server

### Term

mcp-server

### Prompt

Which term matches this definition?

A program that exposes a specific system's capabilities (a database, a ticketing tool, a file store) to AI models through the MCP standard. Each server is a doorway between the model and one of your systems.

### Options

- [x] MCP Server
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

A program that exposes a specific system's capabilities (a database, a ticketing tool, a file store) to AI models through the MCP standard. Each server is a doorway between the model and one of your systems.

## Question: mcp

### Term

mcp

### Prompt

Which term matches this definition?

An open standard for connecting AI models to external tools, systems, and data sources. Before MCP, every model-to-tool connection was custom; MCP standardizes it, like USB did for device connections.

### Options

- [x] MCP (Model Context Protocol)
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

An open standard for connecting AI models to external tools, systems, and data sources. Before MCP, every model-to-tool connection was custom; MCP standardizes it, like USB did for device connections.

## Question: orchestration

### Term

orchestration

### Prompt

Which term matches this definition?

Coordinating multiple models, tools, and workflow steps into one coherent system: deciding which model handles which task, in what order, with what handoffs. As deployments mature, the orchestration layer becomes where the real engineering lives.

### Options

- [x] Orchestration
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Coordinating multiple models, tools, and workflow steps into one coherent system: deciding which model handles which task, in what order, with what handoffs. As deployments mature, the orchestration layer becomes where the real engineering lives.

## Question: quantization

### Term

quantization

### Prompt

Which term matches this definition?

Compressing a model by storing its weights at lower numerical precision, making it smaller, faster, and cheaper to run with a modest accuracy cost. How large models get squeezed onto ordinary hardware.

### Options

- [x] Quantization
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Compressing a model by storing its weights at lower numerical precision, making it smaller, faster, and cheaper to run with a modest accuracy cost. How large models get squeezed onto ordinary hardware.

## Question: rag

### Term

rag

### Prompt

Which term matches this definition?

An architecture where the system first retrieves relevant documents from your own knowledge base, then has the model generate an answer using them. The standard pattern for making AI answer from your content rather than only its training data.

### Options

- [x] Retrieval-Augmented Generation (RAG)
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

An architecture where the system first retrieves relevant documents from your own knowledge base, then has the model generate an answer using them. The standard pattern for making AI answer from your content rather than only its training data.

## Question: skills

### Term

skills

### Prompt

Which term matches this definition?

Packaged, reusable instructions and resources (procedures, templates, examples, scripts) that an AI agent can load on demand to perform a specialized task well. Where MCP connects agents to systems, skills equip them with expertise.

### Options

- [x] Skills
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

Packaged, reusable instructions and resources (procedures, templates, examples, scripts) that an AI agent can load on demand to perform a specialized task well. Where MCP connects agents to systems, skills equip them with expertise.

## Question: tool-use

### Term

tool-use

### Prompt

Which term matches this definition?

The capability that lets a model invoke external software during a conversation: searching the web, querying a database, sending an email, running a calculation. Tool use is what turns a model that talks into a system that acts.

### Options

- [x] Tool Use / Function Calling
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

The capability that lets a model invoke external software during a conversation: searching the web, querying a database, sending an email, running a calculation. Tool use is what turns a model that talks into a system that acts.

## Question: transformer

### Term

transformer

### Prompt

Which term matches this definition?

The neural network design, introduced in 2017, that underpins modern LLMs (the “T” in GPT). Its key innovation is processing all parts of an input in relation to each other simultaneously, which made today's language capabilities possible.

### Options

- [x] Transformer Architecture
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

The neural network design, introduced in 2017, that underpins modern LLMs (the “T” in GPT). Its key innovation is processing all parts of an input in relation to each other simultaneously, which made today's language capabilities possible.

## Question: workflow

### Term

workflow

### Prompt

Which term matches this definition?

A defined sequence of steps that accomplishes a task, with AI handling some or all of the steps in a fixed order. Workflows follow a script; agents decide dynamically. Most reliable AI deployments today are workflows, not agents.

### Options

- [x] Workflow
- [ ] API (Application Programming Interface)
- [ ] Inference
- [ ] Compute / GPU

### Explanation

A defined sequence of steps that accomplishes a task, with AI handling some or all of the steps in a fixed order. Workflows follow a script; agents decide dynamically. Most reliable AI deployments today are workflows, not agents.
