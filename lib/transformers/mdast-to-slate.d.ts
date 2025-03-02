import * as slate from "../models/slate";
import * as mdast from "../models/mdast";
export declare type Decoration = {
    [key in (mdast.Emphasis | mdast.Strong | mdast.Delete | mdast.InlineCode)["type"]]?: true;
};
export declare function mdastToSlate(node: mdast.Root): slate.Node[];
export declare type Paragraph = ReturnType<typeof createParagraph>;
declare function createParagraph(node: mdast.Paragraph, deco: Decoration): {
    type: "paragraph";
    children: slate.Node[];
};
export declare type Heading = ReturnType<typeof createHeading>;
declare function createHeading(node: mdast.Heading, deco: Decoration): {
    type: "heading";
    depth: 1 | 2 | 3 | 4 | 5 | 6;
    children: slate.Node[];
};
export declare type ThematicBreak = ReturnType<typeof createThematicBreak>;
declare function createThematicBreak(node: mdast.ThematicBreak): {
    type: "thematicBreak";
    children: {
        text: string;
    }[];
};
export declare type Blockquote = ReturnType<typeof createBlockquote>;
declare function createBlockquote(node: mdast.Blockquote, deco: Decoration): {
    type: "blockquote";
    children: slate.Node[];
};
export declare type List = ReturnType<typeof createList>;
declare function createList(node: mdast.List, deco: Decoration): {
    type: "list";
    children: slate.Node[];
    ordered: boolean | undefined;
    start: number | undefined;
    spread: boolean | undefined;
};
export declare type ListItem = ReturnType<typeof createListItem>;
declare function createListItem(node: mdast.ListItem, deco: Decoration): {
    type: "listItem";
    children: slate.Node[];
    checked: boolean | undefined;
    spread: boolean | undefined;
};
export declare type Table = ReturnType<typeof createTable>;
declare function createTable(node: mdast.Table, deco: Decoration): {
    type: "table";
    children: slate.Node[];
    align: mdast.AlignType[] | undefined;
};
export declare type TableRow = ReturnType<typeof createTableRow>;
declare function createTableRow(node: mdast.TableRow, deco: Decoration): {
    type: "tableRow";
    children: slate.Node[];
};
export declare type TableCell = ReturnType<typeof createTableCell>;
declare function createTableCell(node: mdast.TableCell, deco: Decoration): {
    type: "tableCell";
    children: slate.Node[];
};
export declare type Html = ReturnType<typeof createHtml>;
declare function createHtml(node: mdast.HTML): {
    type: "html";
    children: {
        text: string;
    }[];
};
export declare type Code = ReturnType<typeof createCode>;
declare function createCode(node: mdast.Code): {
    type: "code";
    lang: string | undefined;
    meta: string | undefined;
    children: {
        text: string;
    }[];
};
export declare type Yaml = ReturnType<typeof createYaml>;
declare function createYaml(node: mdast.YAML): {
    type: "yaml";
    children: {
        text: string;
    }[];
};
export declare type Toml = ReturnType<typeof createToml>;
declare function createToml(node: mdast.TOML): {
    type: "toml";
    children: {
        text: string;
    }[];
};
export declare type Math = ReturnType<typeof createMath>;
declare function createMath(node: mdast.Math): {
    type: "math";
    children: {
        text: string;
    }[];
};
export declare type InlineMath = ReturnType<typeof createInlineMath>;
declare function createInlineMath(node: mdast.InlineMath): {
    type: "inlineMath";
    children: {
        text: string;
    }[];
};
export declare type Definition = ReturnType<typeof createDefinition>;
declare function createDefinition(node: mdast.Definition): {
    type: "definition";
    identifier: string;
    label: string | undefined;
    url: string;
    title: string | undefined;
    children: {
        text: string;
    }[];
};
export declare type FootnoteDefinition = ReturnType<typeof createFootnoteDefinition>;
declare function createFootnoteDefinition(node: mdast.FootnoteDefinition, deco: Decoration): {
    type: "footnoteDefinition";
    children: slate.Node[];
    identifier: string;
    label: string | undefined;
};
export declare type Text = ReturnType<typeof createText>;
declare function createText(text: string, deco: Decoration): {
    text: string;
    emphasis?: true | undefined;
    strong?: true | undefined;
    delete?: true | undefined;
    inlineCode?: true | undefined;
};
export declare type Break = ReturnType<typeof createBreak>;
declare function createBreak(node: mdast.Break): {
    type: "break";
    children: {
        text: string;
    }[];
};
export declare type Link = ReturnType<typeof createLink>;
declare function createLink(node: mdast.Link, deco: Decoration): {
    type: "link";
    children: slate.Node[];
    url: string;
    title: string | undefined;
};
export declare type Image = ReturnType<typeof createImage>;
declare function createImage(node: mdast.Image): {
    type: "image";
    url: string;
    title: string | undefined;
    alt: string | undefined;
    children: {
        text: string;
    }[];
};
export declare type LinkReference = ReturnType<typeof createLinkReference>;
declare function createLinkReference(node: mdast.LinkReference, deco: Decoration): {
    type: "linkReference";
    children: slate.Node[];
    referenceType: mdast.ReferenceType;
    identifier: string;
    label: string | undefined;
};
export declare type ImageReference = ReturnType<typeof createImageReference>;
declare function createImageReference(node: mdast.ImageReference): {
    type: "imageReference";
    alt: string | undefined;
    referenceType: mdast.ReferenceType;
    identifier: string;
    label: string | undefined;
    children: {
        text: string;
    }[];
};
export declare type Footnote = ReturnType<typeof createFootnote>;
declare function createFootnote(node: mdast.Footnote, deco: Decoration): {
    type: "footnote";
    children: slate.Node[];
};
export declare type FootnoteReference = ReturnType<typeof createFootnoteReference>;
declare function createFootnoteReference(node: mdast.FootnoteReference): {
    type: "footnoteReference";
    identifier: string;
    label: string | undefined;
    children: {
        text: string;
    }[];
};
export declare type SlateNode = Paragraph | Heading | ThematicBreak | Blockquote | List | ListItem | Table | TableRow | TableCell | Html | Code | Yaml | Toml | Definition | FootnoteDefinition | Text | Break | Link | Image | LinkReference | ImageReference | Footnote | FootnoteReference | Math | InlineMath;
export {};
