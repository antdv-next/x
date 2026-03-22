import type { SenderProps, SenderRef } from "./interface";

import ForwardSender from "./Sender";
import SenderHeader from "./SenderHeader";
import SenderSwitch from "./SenderSwitch";

export type { SenderProps, SenderRef };

type CompoundedSender = typeof ForwardSender & {
  Header: typeof SenderHeader;
  Switch: typeof SenderSwitch;
};

const Sender = ForwardSender as CompoundedSender;
Sender.Header = SenderHeader;
Sender.Switch = SenderSwitch;

export default Sender;
export { SenderHeader, SenderSwitch };
