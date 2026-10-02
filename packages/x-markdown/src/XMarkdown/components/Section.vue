<script lang="ts">
import { computed, defineComponent } from "vue";

import type { Parser } from "../core/Parser";
import type { VueRenderer } from "../core/VueRenderer";

/**
 * One section of an incrementally rendered document. Vue skips re-rendering
 * this component while its props are unchanged: while streaming, every
 * section but the last keeps the same source string from chunk to chunk, so
 * marked, DOMPurify, the HTML→vnode conversion and patching run only for the
 * section that is still growing.
 *
 * Renders the parsed vnode directly so the DOM is exactly what rendering the
 * whole document at once would produce.
 */
export default defineComponent({
  name: "XMarkdownSection",
  props: {
    /** Markdown source of this section */
    content: {
      type: String,
      required: true,
    },
    parser: {
      type: Object as () => Parser,
      required: true,
    },
    renderer: {
      type: Object as () => VueRenderer,
      required: true,
    },
    /** Whether the streaming tail is appended to this section (only the last one) */
    injectTail: {
      type: Boolean,
      default: false,
    },
    /**
     * Bumped when parser/renderer options change in place (the parent keeps
     * both identities stable), so an options change still re-renders every
     * section even though `content` is unchanged.
     */
    optionsVersion: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const node = computed(() => {
      void props.optionsVersion;
      const html = props.parser.parse(props.content, {
        injectTail: props.injectTail,
      });
      return props.renderer.render(html);
    });

    // Empty sections (leading whitespace, DOMPurify-stripped markup) render
    // nothing — see VueRenderer.render's zero-node branch.
    return () => node.value;
  },
});
</script>
