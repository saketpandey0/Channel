import { DecoratorNode, type NodeKey, type LexicalEditor, type SerializedLexicalNode } from "lexical";

export type SerializedVideoNode = {
  type: "video";
  src: string;
  version: 1;
} & SerializedLexicalNode;

export class VideoNode extends DecoratorNode<JSX.Element> {
  __src: string;

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  static getType(): string {
    return "video";
  }

  static clone(node: VideoNode): VideoNode {
    return new VideoNode(node.__src, node.__key);
  }

  // ✅ Required for deserialization
  static importJSON(serializedNode: SerializedVideoNode): VideoNode {
    const { src } = serializedNode;
    return new VideoNode(src);
  }

  // ✅ Required for serialization
  exportJSON(): SerializedVideoNode {
    return {
      type: "video",
      src: this.__src,
      version: 1,
    };
  }

  createDOM(): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(editor: LexicalEditor): JSX.Element {
    return (
      <video
        controls
        className="max-w-full rounded-lg shadow-md my-4"
        src={this.__src}
      />
    );
  }
}

// ✅ Factory helper
export function $createVideoNode(src: string): VideoNode {
  return new VideoNode(src);
}

export function $isVideoNode(node: unknown): node is VideoNode {
  return node instanceof VideoNode;
}
