import { defineComponent } from "vue";

import enUS from "../../../locale/en_US";
import useLocale from "../../../locale/useLocale";

export default defineComponent({
  name: "StopLoadingIcon",
  props: {
    class: { type: String, default: undefined },
  },
  setup(props) {
    const [contextLocale] = useLocale("Sender", enUS.Sender);

    return () => (
      <svg
        color="currentColor"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        class={props.class}
      >
        <title>{contextLocale.value.stopLoading}</title>
        <rect
          fill="currentColor"
          height="250"
          rx="24"
          ry="24"
          width="250"
          x="375"
          y="375"
        />
        <circle
          cx="500"
          cy="500"
          fill="none"
          r="450"
          stroke="currentColor"
          stroke-width="100"
          opacity="0.45"
        />
        <circle
          cx="500"
          cy="500"
          fill="none"
          r="450"
          stroke="currentColor"
          stroke-width="100"
          stroke-dasharray="600 9999999"
        >
          <animateTransform
            attributeName="transform"
            dur="1s"
            from="0 500 500"
            repeatCount="indefinite"
            to="360 500 500"
            type="rotate"
          />
        </circle>
      </svg>
    );
  },
});
