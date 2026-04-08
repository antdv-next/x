<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <a-space wrap>
      <ax-bubble content="filled - default" />
      <ax-bubble content="filled - round" shape="round" />
      <ax-bubble content="filled - corner left" shape="corner" />
      <ax-bubble
        content="filled - corner right"
        shape="corner"
        placement="end"
      />
    </a-space>

    <a-space wrap>
      <ax-bubble content="outlined - default" variant="outlined" />
      <ax-bubble content="outlined - round" variant="outlined" shape="round" />
      <ax-bubble
        content="outlined - corner left"
        variant="outlined"
        shape="corner"
      />
      <ax-bubble
        content="outlined - corner right"
        variant="outlined"
        shape="corner"
        placement="end"
      />
    </a-space>

    <a-space wrap>
      <ax-bubble content="shadow - default" variant="shadow" />
      <ax-bubble content="shadow - round" variant="shadow" shape="round" />
      <ax-bubble
        content="shadow - corner left"
        variant="shadow"
        shape="corner"
      />
      <ax-bubble
        content="shadow - corner right"
        variant="shadow"
        shape="corner"
        placement="end"
      />
    </a-space>

    <a-space wrap>
      <ax-bubble variant="borderless" content="borderless bubble" />
    </a-space>
  </a-space>
</template>

<docs lang="zh-CN">
变体与形状，无边框样式 `borderless` 的 Bubble 适用于渲染自定义样式的内容。
</docs>

<docs lang="en-US">
variant and shape, `borderless` Bubble is suitable for rendering custom-styled content.
</docs>
