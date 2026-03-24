import { Progress, theme } from "antdv-next";

export interface ProgressProps {
  prefixCls: string;
  percent: number;
}

export default function ProgressNode(props: ProgressProps) {
  const { token } = theme.useToken();

  return (
    <Progress
      type="circle"
      percent={props.percent}
      size={token.value.fontSizeHeading2 * 2}
      strokeColor="#FFF"
      railColor="rgba(255, 255, 255, 0.3)"
      format={(ptg?: number) => (
        <span style={{ color: "#FFF" }}>{(ptg ?? 0).toFixed(0)}%</span>
      )}
    />
  );
}
