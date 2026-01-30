export type Block = {
  id: string;           // unique per block
  type: string;         // "heading", "text", "image", etc.
  props: Record<string, any>;
};
