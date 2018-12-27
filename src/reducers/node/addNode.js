import { createNode } from "../helpers/createInitialState";
import { EditorState, ContentState, convertFromHTML } from "draft-js";

export const addNode = (state, x, y, name) => {
  const node = createNode(x, y, 180, 40, true);

  const blocksFromHTML = convertFromHTML(
    `${name}`
  );
  const contentState = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  node.editorState = EditorState.createWithContent(contentState);

  return node;
};
