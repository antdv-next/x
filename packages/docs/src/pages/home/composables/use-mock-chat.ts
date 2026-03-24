import { onBeforeUnmount, ref } from "vue";

type ChatRole = "system" | "ai" | "user";

export interface MockChatItem {
  key: string;
  role: ChatRole;
  content: string;
  loading?: boolean;
}

let seed = 0;
const nextKey = () => `home_msg_${seed++}`;

export function useMockChat(greeting: string, placeholder: string) {
  const items = ref<MockChatItem[]>([
    {
      key: nextKey(),
      role: "system",
      content: greeting,
    },
  ]);
  const loading = ref(false);
  const input = ref("");
  const timers = new Set<ReturnType<typeof setTimeout>>();

  const pushAIResponse = (query: string) => {
    const loadingKey = nextKey();
    items.value = [
      ...items.value,
      { key: nextKey(), role: "user", content: query },
      { key: loadingKey, role: "ai", content: placeholder, loading: true },
    ];
    loading.value = true;

    const timer = setTimeout(() => {
      items.value = items.value.map(item =>
        item.key === loadingKey
          ? {
              key: item.key,
              role: "ai",
              content: `Mock success return. You said: ${query}`,
              loading: false,
            }
          : item,
      );
      loading.value = false;
      timers.delete(timer);
    }, 900);

    timers.add(timer);
  };

  const submit = (content: string) => {
    const query = content.trim();
    if (!query) return;
    pushAIResponse(query);
    input.value = "";
  };

  const submitPreset = (content: string) => {
    submit(content);
  };

  onBeforeUnmount(() => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
  });

  return {
    items,
    input,
    loading,
    submit,
    submitPreset,
  };
}
