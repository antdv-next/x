<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
import { ref } from "vue";

const code = `# Python Example

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

# Test the function
numbers = [3, 6, 8, 10, 1, 2, 1]
print(quicksort(numbers))`;

const copied = ref(false);

function handleCopy() {
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <CodeHighlighter :content="code" language="python" @copy="handleCopy" />
</template>

<docs lang="zh-CN">
点击复制按钮可复制代码，通过 `onCopy` 事件监听复制操作。
</docs>

<docs lang="en-US">
Click the copy button to copy code, listen to copy events via `onCopy`.
</docs>
