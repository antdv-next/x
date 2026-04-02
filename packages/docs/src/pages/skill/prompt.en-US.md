---
title: Prompt Templates
description: Prompt template references for using X skills.
order: 2
---

This document provides prompt templates for using X skills, helping you use various skill functions more efficiently.

### Chat Function Development

> **Basic Chat Function**

```text
Use the skill to help me create a complete chat application with the following requirements:
- Use Antdv Next X UI components
- Create a custom ChatProvider to adapt to streaming interfaces, using XRequest to handle SSE requests
- Interface address: `https://api.example.com/chat`
- Request format: `{ query: string, sessionId?: string }`
- Response format: `{ content: string, time: string, status: 'success' | 'error', role: 'assistant' | 'user' }`
- Add error handling and user-friendly error prompts
- Organize code modularly by function: hooks/, types/, utils/, components/
```

### Partial Optimization and Modification

> **Custom Chat Provider - Tool Calls**

```text
Use the skill to help me extend the current ChatProvider to support tool calls:
- Add tool call functionality based on the existing ChatProvider
- Interface address: `https://api.example.com/chat`
- Request format: `{ query: string, sessionId?: string }`
- Response format: `{
    content: string,
    time: string,
    status: 'success' | 'error',
    tools?: Array<{
      id: string,
      name: string,
      code: string,
      status: 'pending' | 'running' | 'success' | 'error',
      output?: any,
      error?: string
    }>
   }`
- Message format: `{
    role: 'assistant' | 'user',
    content: string,
    time: string,
    status: 'success' | 'error',
    tools?: Array<{
      id: string,
      name: string,
      code: string,
      status: 'running' | 'success' | 'error',
    }>
  }`
```
