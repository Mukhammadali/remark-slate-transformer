import * as slate from "../models/slate";
import * as mdast from "../models/mdast";
import { parse } from 'query-string';

export type Decoration = {
  [key in (
    | mdast.Emphasis
    | mdast.Strong
    | mdast.Delete
    | mdast.InlineCode
  )["type"]]?: true;
};

export function mdastToSlate(node: mdast.Root): slate.Node[] {
  return createSlateRoot(node);
}

function createSlateRoot(root: mdast.Root): slate.Node[] {
  return convertNodes(root.children, {});
}

function convertNodes(nodes: mdast.Content[], deco: Decoration): slate.Node[] {
  if (nodes.length === 0) {
    return [{ text: "" }];
  }

  return nodes.reduce<slate.Node[]>((acc, node) => {
    acc.push(...createSlateNode(node, deco));
    return acc;
  }, []);
}

function createSlateNode(node: mdast.Content, deco: Decoration): SlateNode[] {

  // @ts-ignore
  const customComponentData = node.type === 'paragraph' && node?.children?.[0]?.value?.match(/\{\{[^}]*\}\}/);

  if (customComponentData?.length) {
    // @ts-ignore
    return handleCustomMarkdown(node?.children?.[0]);
  }


  switch (node.type) {
    case "paragraph":
      return [createParagraph(node, deco)];
    case "heading":
      return [createHeading(node, deco)];
    case "thematicBreak":
      return [createThematicBreak(node)];
    case "blockquote":
      return [createBlockquote(node, deco)];
    case "list":
      return [createList(node, deco)];
    case "listItem":
      return [createListItem(node, deco)];
    case "table":
      return [createTable(node, deco)];
    case "tableRow":
      return [createTableRow(node, deco)];
    case "tableCell":
      return [createTableCell(node, deco)];
    case "html":
      return [createHtml(node)];
    case "code":
      return [createCode(node)];
    case "yaml":
      return [createYaml(node)];
    case "toml":
      return [createToml(node)];
    case "definition":
      return [createDefinition(node)];
    case "footnoteDefinition":
      return [createFootnoteDefinition(node, deco)];
    case "text":
      const colorMatches = node.value?.match(/\{[a-zA-Z]+\}\([^)]*\)/gm);

      if (colorMatches?.length){
        const words = handleColoredText(node.value);
        return words.map((word:any) => {
          return createText(word.text, deco, word.color)
        })
      }
      return [createText(node.value, deco)];
    case "emphasis":
    case "strong":
    case "delete": {
      const { type, children } = node;
      return children.reduce<SlateNode[]>((acc, n) => {
        acc.push(...createSlateNode(n, { ...deco, [type]: true }));
        return acc;
      }, []);
    }
    case "inlineCode": {
      const { type, value } = node;
      return [createText(value, { ...deco, [type]: true })];
    }
    // @ts-ignore
    case "list-item-text": {
      const { type, children } = node;
      return [{
        // @ts-ignore
        type,
        children: convertNodes(children,deco)
      }];
    }
    case "break":
      return [createBreak(node)];
    case "link":
      return [createLink(node, deco)];
    case "image":
      return [createImage(node)];
    case "linkReference":
      return [createLinkReference(node, deco)];
    case "imageReference":
      return [createImageReference(node)];
    case "footnote":
      return [createFootnote(node, deco)];
    case "footnoteReference":
      return [createFootnoteReference(node)];
    case "math":
      return [createMath(node)];
    case "inlineMath":
      return [createInlineMath(node)];
    default:
      const _: never = node;
      break;
  }
  return [];
}

export type Paragraph = ReturnType<typeof createParagraph>;

function parseColorText (str:string) {
  const color = str.match(/\{[a-zA-Z]+\}/gm)?.[0].replace('{', '').replace('}', '')
  const text = str.match(/\([^)]*\)/gm)?.[0]?.replace('(', '').replace(')', '')
  return {
    color, 
    text
  }
}

function handleColoredText(str:string):any{
  let text = str;

  const colorMatches = text.match(/\{[a-zA-Z]+\}\([^)]*\)/gm);

  if(!colorMatches || !colorMatches.length) return [];
  const words = [];
  
  for (let i = 0; i < colorMatches.length; i++) {
    const index = text.indexOf(colorMatches[i]);
    if (index === 0) {
      words.push(parseColorText(colorMatches[i])) 
      text = text.replace(colorMatches[i], '')
    } else {
      words.push({
        text: text.slice(0, index)
      })
      // @ts-ignore
      text = text.replace(words[words.length - 1].text, '');
      
      words.push(parseColorText(colorMatches[i])) 
      text = text.replace(colorMatches[i], '')
    }
    
    if(i === colorMatches.length - 1 && text) {
      words.push({
        text: text
      });
    }
  }
  return words;
}

function handleCustomMarkdown(node: mdast.Text){
  const matches = node.value.match(/\{\{[^}]*\}\}/)
  return matches!.reduce((prev, curr) => {
    prev.push(
      // @ts-ignore
      createCustomNode(curr)
    )
    return prev;
  }, [])
}

function createCustomNode(rawData: any) {
  const body = rawData.replace('{{', '').replace('}}', '')
  const [subtype, options='', props=''] = body.split('|');
  const parsedProps = parse(props);
  const subtypeLowercased = subtype.toLowerCase();
  let payload:any = {
    type: 'custom',
    subtype: subtypeLowercased,
    ...parsedProps,
    ...parse(options),
    children: [{text: ''}]
  }
  if (['image', 'video'].includes(subtypeLowercased)){
    // @ts-ignore
    const ids = parsedProps?.id?.split(',');
    payload.ids = ids?.length ? ids : [];
    payload.urls = [];
  }
  if ('newline' === subtypeLowercased) {
    payload = createParagraph({
      type: 'paragraph',
      children: []
    }, {})
  }
  return payload;
}

function createParagraph(node: mdast.Paragraph, deco: Decoration) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, deco),
  };
}

export type Heading = ReturnType<typeof createHeading>;

function createHeading(node: mdast.Heading, deco: Decoration) {
  const { type, children, depth } = node;
  return {
    type,
    depth,
    children: convertNodes(children, deco),
  };
}

export type ThematicBreak = ReturnType<typeof createThematicBreak>;

function createThematicBreak(node: mdast.ThematicBreak) {
  return {
    type: node.type,
    children: [{ text: "" }],
  };
}

export type Blockquote = ReturnType<typeof createBlockquote>;

function createBlockquote(node: mdast.Blockquote, deco: Decoration) {
  return {
    type: node.type,
    children: convertNodes(node.children, deco),
  };
}

export type List = ReturnType<typeof createList>;

function createList(node: mdast.List, deco: Decoration) {
  const { type, children, ordered, start, spread } = node;
  return {
    type: ordered ? 'ordered-list' : 'unordered-list',
    children: convertNodes(children, deco),
    // ordered,
    // start,
    // spread,
  };
}

export type ListItem = ReturnType<typeof createListItem>;



function createListItem(node: mdast.ListItem, deco: Decoration) {
  const { type, children, checked, spread } = node;
  const newChildren = children.map((child) => {
    if (child.type === 'paragraph'){
      return {
        // @ts-ignore
        ...child,
        type: 'list-item-text',
      }
      // @ts-ignore
    } else if (child.children) {
      return child;
    }
  })
  return {
    type: 'list-item',
    // @ts-ignore
    children: convertNodes(newChildren, deco),
  };
}

export type Table = ReturnType<typeof createTable>;

function createTable(node: mdast.Table, deco: Decoration) {
  const { type, children, align } = node;
  return {
    type,
    children: convertNodes(children, deco),
    align,
  };
}

export type TableRow = ReturnType<typeof createTableRow>;

function createTableRow(node: mdast.TableRow, deco: Decoration) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, deco),
  };
}

export type TableCell = ReturnType<typeof createTableCell>;

function createTableCell(node: mdast.TableCell, deco: Decoration) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, deco),
  };
}

export type Html = ReturnType<typeof createHtml>;

function createHtml(node: mdast.HTML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Code = ReturnType<typeof createCode>;

function createCode(node: mdast.Code) {
  const { type, value, lang, meta } = node;
  return {
    type,
    lang,
    meta,
    children: [{ text: value }],
  };
}

export type Yaml = ReturnType<typeof createYaml>;

function createYaml(node: mdast.YAML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Toml = ReturnType<typeof createToml>;

function createToml(node: mdast.TOML) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Math = ReturnType<typeof createMath>;

function createMath(node: mdast.Math) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type InlineMath = ReturnType<typeof createInlineMath>;

function createInlineMath(node: mdast.InlineMath) {
  const { type, value } = node;
  return {
    type,
    children: [{ text: value }],
  };
}

export type Definition = ReturnType<typeof createDefinition>;

function createDefinition(node: mdast.Definition) {
  const { type, identifier, label, url, title } = node;
  return {
    type,
    identifier,
    label,
    url,
    title,
    children: [{ text: "" }],
  };
}

export type FootnoteDefinition = ReturnType<typeof createFootnoteDefinition>;

function createFootnoteDefinition(
  node: mdast.FootnoteDefinition,
  deco: Decoration
) {
  const { type, children, identifier, label } = node;
  return {
    type,
    children: convertNodes(children, deco),
    identifier,
    label,
  };
}

export type Text = ReturnType<typeof createText>;

function createText(text: string, deco: Decoration, color?:string) {
  const payload:any = {
    ...deco,
    text,
  };
  if (color) {
    payload.color = color;
  }
  return payload;
}

export type Break = ReturnType<typeof createBreak>;

function createBreak(node: mdast.Break) {
  return {
    type: node.type,
    children: [{ text: "" }],
  };
}

export type Link = ReturnType<typeof createLink>;

function createLink(node: mdast.Link, deco: Decoration) {
  const { type, children, url, title } = node;
  return {
    type,
    children: convertNodes(children, deco),
    url,
    title,
  };
}

export type Image = ReturnType<typeof createImage>;

function createImage(node: mdast.Image) {
  const { type, url, title, alt } = node;
  return {
    type,
    url,
    title,
    alt,
    children: [{ text: "" }],
  };
}

export type LinkReference = ReturnType<typeof createLinkReference>;

function createLinkReference(node: mdast.LinkReference, deco: Decoration) {
  const { type, children, referenceType, identifier, label } = node;
  return {
    type,
    children: convertNodes(children, deco),
    referenceType,
    identifier,
    label,
  };
}

export type ImageReference = ReturnType<typeof createImageReference>;

function createImageReference(node: mdast.ImageReference) {
  const { type, alt, referenceType, identifier, label } = node;
  return {
    type,
    alt,
    referenceType,
    identifier,
    label,
    children: [{ text: "" }],
  };
}

export type Footnote = ReturnType<typeof createFootnote>;

function createFootnote(node: mdast.Footnote, deco: Decoration) {
  const { type, children } = node;
  return {
    type,
    children: convertNodes(children, deco),
  };
}

export type FootnoteReference = ReturnType<typeof createFootnoteReference>;

function createFootnoteReference(node: mdast.FootnoteReference) {
  const { type, identifier, label } = node;
  return {
    type,
    identifier,
    label,
    children: [{ text: "" }],
  };
}

export type SlateNode =
  | Paragraph
  | Heading
  | ThematicBreak
  | Blockquote
  | List
  | ListItem
  | Table
  | TableRow
  | TableCell
  | Html
  | Code
  | Yaml
  | Toml
  | Definition
  | FootnoteDefinition
  | Text
  | Break
  | Link
  | Image
  | LinkReference
  | ImageReference
  | Footnote
  | FootnoteReference
  | Math
  | InlineMath;
