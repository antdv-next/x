import FileCard, { type FileCardProps, XFileCard } from "./FileCard";
import List, { type FileCardListProps, XFileCardList } from "./List";

type FileCardType = typeof FileCard & {
  List: typeof List;
};

const FileCardWithSub = FileCard as FileCardType;
FileCardWithSub.List = List;

export { List as FileCardList, XFileCard, XFileCardList };

export type { FileCardListProps, FileCardProps };

export default FileCardWithSub;
