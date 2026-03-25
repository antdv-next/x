---
category: Components
group:
  title: Data Provider
  order: 2
title: OpenAIChatProvider
order: 2
packageName: x-sdk
---

`OpenAIChatProvider` is a `Chat Provider` compatible with the `OpenAI` interface. It automatically converts request parameters and response data into the OpenAI API format.

`XModelParams` defines the request parameter types for `OpenAIChatProvider`, `XModelResponse` defines the response data types, and `XModelMessage` defines the complete message data types. These types can be directly used in the generics `ChatMessage`, `Input`, and `Output` of `useXChat`.
