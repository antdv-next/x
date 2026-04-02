import type { SenderProps, SenderRef, SlotConfigType } from "./interface";

import ForwardSender from "./Sender";
import SenderHeader from "./SenderHeader";
import SenderSwitch from "./SenderSwitch";

export type { SenderProps, SenderRef, SlotConfigType };

type CompoundedSender = typeof ForwardSender & {
  Header: typeof SenderHeader;
  Switch: typeof SenderSwitch;
};

const Sender = ForwardSender as CompoundedSender;
Sender.Header = SenderHeader;
Sender.Switch = SenderSwitch;

export default Sender;
export { SenderHeader, SenderSwitch };
