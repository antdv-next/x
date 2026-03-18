import FileCard, { type FileCardProps } from "./FileCard";
import List, { type FileCardListProps } from "./List";

type FileCardType = typeof FileCard & {
  List: typeof List;
};

const FileCardWithSub = FileCard as FileCardType;
FileCardWithSub.List = List;

export { List as FileCardList };

export type { FileCardListProps, FileCardProps };

export default FileCardWithSub;
