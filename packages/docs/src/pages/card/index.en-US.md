---
order: 1
title: Introduction
packageName: x-card
---

`@antdv-next/x-card` is a dynamic card runtime for the A2UI protocol. It consumes structured command streams from an Agent and renders them into interactive Vue component trees.

## Core Capabilities

- Streaming command consumption: `createSurface / updateComponents / updateDataModel / deleteSurface`
- Declarative rendering: maps protocol nodes to registered Vue components
- Data binding: supports path-based reads/writes and Action write-back
- Runtime isolation: maintains isolated state per `surfaceId`

## Installation

<InstallDependencies npm='npm install @antdv-next/x-card' yarn='yarn add @antdv-next/x-card' pnpm='pnpm install @antdv-next/x-card' bun='bun add @antdv-next/x-card'></InstallDependencies>

## Quick Start

```tsx
import { defineComponent, ref } from "vue";
import XCard from "@antdv-next/x-card";

const Text = defineComponent({
  props: { text: String },
  setup: props => () => <div>{props.text}</div>,
});

export default defineComponent({
  setup() {
    const commands = ref([
      {
        version: "v0.9",
        createSurface: { surfaceId: "demo" },
      },
      {
        version: "v0.9",
        updateComponents: {
          surfaceId: "demo",
          components: [
            {
              id: "root",
              component: "Text",
              text: "Hello XCard",
            },
          ],
        },
      },
    ]);

    return () => (
      <XCard.Box commands={commands.value} components={{ Text }}>
        <XCard id="demo" />
      </XCard.Box>
    );
  },
});
```
