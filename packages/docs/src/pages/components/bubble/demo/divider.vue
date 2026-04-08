<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <ax-bubble content="message 1" />
    <ax-bubble-divider content="Solid" />
    <ax-bubble content="message 2" placement="end" />
    <ax-bubble-divider
      content="Dashed"
      :divider-props="{ variant: 'dashed' }"
    />
    <ax-bubble content="message 3" />
    <ax-bubble-divider
      content="Dotted"
      :divider-props="{ variant: 'dotted' }"
    />
    <ax-bubble content="message 4" placement="end" />
    <ax-bubble-divider content="Plain Text" :divider-props="{ plain: true }" />
    <ax-bubble content="message 5" />
  </a-space>
</template>

<docs lang="zh-CN">
分割线 Bubble。
</docs>

<docs lang="en-US">
Bubble of divider.
</docs>
