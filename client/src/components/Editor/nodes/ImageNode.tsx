import { DecoratorNode, type EditorConfig, type LexicalNode, type NodeKey } from "lexical";

// React component for rendering image
function ImageComponent({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full rounded-lg border border-gray-300 shadow-sm"
    />
  );
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  createDOM(): HTMLElement {
    return document.createElement("span");
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return <ImageComponent src={this.__src} alt={this.__alt} />;
  }
}

// 👇 Factory function you were missing
export function $createImageNode(src: string, alt: string): ImageNode {
  return new ImageNode(src, alt);
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
