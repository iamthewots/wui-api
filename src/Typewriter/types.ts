export interface TypewriterSettings {
    timePerChar?: number;
    deleteModifier?: number;
    ignorePunctuation?: boolean;
}

export interface TypewriterElementData {
    settings?: TypewriterSettings;
    textNodesData: TypewriterTextNodeData[];
    charsCount: number;
    status: TypewriterElementStatus;
    lastNodeIndex: number;
    lastCharIndex: number;
}

export interface TypewriterTextNodeData {
    node: Node;
    text: string;
    length: number;
}

export enum TypewriterElementStatus {
    Clear,
    InProgress,
    Partial,
    Initial,
}
