'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var queryString = require('query-string');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function mdastToSlate(node) {
    return createSlateRoot(node);
}
function createSlateRoot(root) {
    return convertNodes$3(root.children, {});
}
function convertNodes$3(nodes, deco) {
    if (nodes.length === 0) {
        return [{ text: "" }];
    }
    return nodes.reduce(function (acc, node) {
        acc.push.apply(acc, createSlateNode(node, deco));
        return acc;
    }, []);
}
function createSlateNode(node, deco) {
    var _a;
    var _b, _c, _d, _e, _f;
    // @ts-ignore
    var customComponentData = node.type === 'paragraph' && ((_d = (_c = (_b = node === null || node === void 0 ? void 0 : node.children) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.match(/\{\{[^}]*\}\}/));
    if (customComponentData === null || customComponentData === void 0 ? void 0 : customComponentData.length) {
        // @ts-ignore
        return handleCustomMarkdown((_e = node === null || node === void 0 ? void 0 : node.children) === null || _e === void 0 ? void 0 : _e[0]);
    }
    switch (node.type) {
        case "paragraph":
            return [createParagraph$1(node, deco)];
        case "heading":
            return [createHeading$1(node, deco)];
        case "thematicBreak":
            return [createThematicBreak$1(node)];
        case "blockquote":
            return [createBlockquote$1(node, deco)];
        case "list":
            return [createList$1(node, deco)];
        case "listItem":
            return [createListItem$1(node, deco)];
        case "table":
            return [createTable$1(node, deco)];
        case "tableRow":
            return [createTableRow$1(node, deco)];
        case "tableCell":
            return [createTableCell$1(node, deco)];
        case "html":
            return [createHtml$1(node)];
        case "code":
            return [createCode$1(node)];
        case "yaml":
            return [createYaml$1(node)];
        case "toml":
            return [createToml$1(node)];
        case "definition":
            return [createDefinition$1(node)];
        case "footnoteDefinition":
            return [createFootnoteDefinition$1(node, deco)];
        case "text":
            var colorMatches = (_f = node.value) === null || _f === void 0 ? void 0 : _f.match(/\{[a-zA-Z]+\}\([^)]*\)/gm);
            if (colorMatches === null || colorMatches === void 0 ? void 0 : colorMatches.length) {
                var words = handleColoredText(node.value);
                return words.map(function (word) {
                    return createText(word.text, deco, word.color);
                });
            }
            return [createText(node.value, deco)];
        case "emphasis":
        case "strong":
        case "delete": {
            var type_1 = node.type, children = node.children;
            return children.reduce(function (acc, n) {
                var _a;
                acc.push.apply(acc, createSlateNode(n, __assign(__assign({}, deco), (_a = {}, _a[type_1] = true, _a))));
                return acc;
            }, []);
        }
        case "inlineCode": {
            var type = node.type, value = node.value;
            return [createText(value, __assign(__assign({}, deco), (_a = {}, _a[type] = true, _a)))];
        }
        // @ts-ignore
        case "list-item-text": {
            var type = node.type, children = node.children;
            return [{
                    // @ts-ignore
                    type: type,
                    children: convertNodes$3(children, deco)
                }];
        }
        case "break":
            return [createBreak$1(node)];
        case "link":
            return [createLink$1(node, deco)];
        case "image":
            return [createImage$1(node)];
        case "linkReference":
            return [createLinkReference$1(node, deco)];
        case "imageReference":
            return [createImageReference$1(node)];
        case "footnote":
            return [createFootnote$1(node, deco)];
        case "footnoteReference":
            return [createFootnoteReference(node)];
        case "math":
            return [createMath$1(node)];
        case "inlineMath":
            return [createInlineMath$1(node)];
    }
    return [];
}
function parseColorText(str) {
    var _a, _b, _c;
    var color = (_a = str.match(/\{[a-zA-Z]+\}/gm)) === null || _a === void 0 ? void 0 : _a[0].replace('{', '').replace('}', '');
    var text = (_c = (_b = str.match(/\([^)]*\)/gm)) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.replace('(', '').replace(')', '');
    return {
        color: color,
        text: text
    };
}
function handleColoredText(str) {
    var text = str;
    var colorMatches = text.match(/\{[a-zA-Z]+\}\([^)]*\)/gm);
    if (!colorMatches || !colorMatches.length)
        return [];
    var words = [];
    for (var i = 0; i < colorMatches.length; i++) {
        var index = text.indexOf(colorMatches[i]);
        if (index === 0) {
            words.push(parseColorText(colorMatches[i]));
            text = text.replace(colorMatches[i], '');
        }
        else {
            words.push({
                text: text.slice(0, index)
            });
            // @ts-ignore
            text = text.replace(words[words.length - 1].text, '');
            words.push(parseColorText(colorMatches[i]));
            text = text.replace(colorMatches[i], '');
        }
        if (i === colorMatches.length - 1 && text) {
            words.push({
                text: text
            });
        }
    }
    return words;
}
function handleCustomMarkdown(node) {
    var matches = node.value.match(/\{\{[^}]*\}\}/);
    return matches.reduce(function (prev, curr) {
        prev.push(
        // @ts-ignore
        createCustomNode(curr));
        return prev;
    }, []);
}
function createCustomNode(rawData) {
    var _a;
    var body = rawData.replace('{{', '').replace('}}', '');
    var _b = body.split('|'), subtype = _b[0], _c = _b[1], options = _c === void 0 ? '' : _c, _d = _b[2], props = _d === void 0 ? '' : _d;
    var parsedProps = queryString.parse(props);
    var subtypeLowercased = subtype.toLowerCase();
    var payload = __assign(__assign(__assign({ type: 'custom', subtype: subtypeLowercased }, parsedProps), queryString.parse(options)), { children: [{ text: '' }] });
    if (['image', 'video'].includes(subtypeLowercased)) {
        // @ts-ignore
        var ids = (_a = parsedProps === null || parsedProps === void 0 ? void 0 : parsedProps.id) === null || _a === void 0 ? void 0 : _a.split(',');
        payload.ids = (ids === null || ids === void 0 ? void 0 : ids.length) ? ids : [];
        payload.urls = [];
    }
    return payload;
}
function createParagraph$1(node, deco) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$3(children, deco),
    };
}
function createHeading$1(node, deco) {
    var type = node.type, children = node.children, depth = node.depth;
    return {
        type: type,
        depth: depth,
        children: convertNodes$3(children, deco),
    };
}
function createThematicBreak$1(node) {
    return {
        type: node.type,
        children: [{ text: "" }],
    };
}
function createBlockquote$1(node, deco) {
    return {
        type: node.type,
        children: convertNodes$3(node.children, deco),
    };
}
function createList$1(node, deco) {
    node.type; var children = node.children, ordered = node.ordered; node.start; node.spread;
    return {
        type: ordered ? 'ordered-list' : 'unordered-list',
        children: convertNodes$3(children, deco),
        // ordered,
        // start,
        // spread,
    };
}
function createListItem$1(node, deco) {
    node.type; var children = node.children; node.checked; node.spread;
    var newChildren = children.map(function (child) {
        if (child.type === 'paragraph') {
            return __assign(__assign({}, child), { type: 'list-item-text' });
            // @ts-ignore
        }
        else if (child.children) {
            return child;
        }
    });
    return {
        type: 'list-item',
        // @ts-ignore
        children: convertNodes$3(newChildren, deco),
    };
}
function createTable$1(node, deco) {
    var type = node.type, children = node.children, align = node.align;
    return {
        type: type,
        children: convertNodes$3(children, deco),
        align: align,
    };
}
function createTableRow$1(node, deco) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$3(children, deco),
    };
}
function createTableCell$1(node, deco) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$3(children, deco),
    };
}
function createHtml$1(node) {
    var type = node.type, value = node.value;
    return {
        type: type,
        children: [{ text: value }],
    };
}
function createCode$1(node) {
    var type = node.type, value = node.value, lang = node.lang, meta = node.meta;
    return {
        type: type,
        lang: lang,
        meta: meta,
        children: [{ text: value }],
    };
}
function createYaml$1(node) {
    var type = node.type, value = node.value;
    return {
        type: type,
        children: [{ text: value }],
    };
}
function createToml$1(node) {
    var type = node.type, value = node.value;
    return {
        type: type,
        children: [{ text: value }],
    };
}
function createMath$1(node) {
    var type = node.type, value = node.value;
    return {
        type: type,
        children: [{ text: value }],
    };
}
function createInlineMath$1(node) {
    var type = node.type, value = node.value;
    return {
        type: type,
        children: [{ text: value }],
    };
}
function createDefinition$1(node) {
    var type = node.type, identifier = node.identifier, label = node.label, url = node.url, title = node.title;
    return {
        type: type,
        identifier: identifier,
        label: label,
        url: url,
        title: title,
        children: [{ text: "" }],
    };
}
function createFootnoteDefinition$1(node, deco) {
    var type = node.type, children = node.children, identifier = node.identifier, label = node.label;
    return {
        type: type,
        children: convertNodes$3(children, deco),
        identifier: identifier,
        label: label,
    };
}
function createText(text, deco, color) {
    var payload = __assign(__assign({}, deco), { text: text });
    if (color) {
        payload.color = color;
    }
    return payload;
}
function createBreak$1(node) {
    return {
        type: node.type,
        children: [{ text: "" }],
    };
}
function createLink$1(node, deco) {
    var type = node.type, children = node.children, url = node.url, title = node.title;
    return {
        type: type,
        children: convertNodes$3(children, deco),
        url: url,
        title: title,
    };
}
function createImage$1(node) {
    var type = node.type, url = node.url, title = node.title, alt = node.alt;
    return {
        type: type,
        url: url,
        title: title,
        alt: alt,
        children: [{ text: "" }],
    };
}
function createLinkReference$1(node, deco) {
    var type = node.type, children = node.children, referenceType = node.referenceType, identifier = node.identifier, label = node.label;
    return {
        type: type,
        children: convertNodes$3(children, deco),
        referenceType: referenceType,
        identifier: identifier,
        label: label,
    };
}
function createImageReference$1(node) {
    var type = node.type, alt = node.alt, referenceType = node.referenceType, identifier = node.identifier, label = node.label;
    return {
        type: type,
        alt: alt,
        referenceType: referenceType,
        identifier: identifier,
        label: label,
        children: [{ text: "" }],
    };
}
function createFootnote$1(node, deco) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$3(children, deco),
    };
}
function createFootnoteReference(node) {
    var type = node.type, identifier = node.identifier, label = node.label;
    return {
        type: type,
        identifier: identifier,
        label: label,
        children: [{ text: "" }],
    };
}

function plugin$3() {
    // @ts-ignore
    this.Compiler = function (node) {
        return mdastToSlate(node);
    };
}

function slateToMdast(node) {
    return createMdastRoot(node);
}
function createMdastRoot(node) {
    var root = {
        type: "root",
        children: convertNodes$2(node.children),
    };
    return root;
}
function convertNodes$2(nodes) {
    var mdastNodes = [];
    var textQueue = [];
    var _loop_1 = function (i) {
        var n = nodes[i];
        if (n && isText(n)) {
            textQueue.push(n);
        }
        else {
            var mdastTexts = [];
            var starts_1 = [];
            var textTemp = "";
            var _loop_2 = function (j) {
                var cur = textQueue[j];
                textTemp += cur.text;
                var prevStartsStr = starts_1.toString();
                var prev = textQueue[j - 1];
                var next = textQueue[j + 1];
                var ends = [];
                ["inlineCode", "emphasis", "strong", "delete"].forEach(function (k) {
                    if (cur[k]) {
                        if (!prev || !prev[k]) {
                            starts_1.push(k);
                        }
                        if (!next || !next[k]) {
                            ends.push(k);
                        }
                    }
                });
                if (cur["color"]) {
                    if (!prev || !prev["color"]) {
                        starts_1.push("color");
                    }
                    if (!next || !next["color"]) {
                        ends.push("color");
                    }
                }
                var endsToRemove = starts_1.reduce(function (acc, k, kIndex) {
                    if (ends.includes(k)) {
                        acc.push({ key: k, index: kIndex });
                    }
                    return acc;
                }, []);
                if (starts_1.length > 0) {
                    var bef = "";
                    var aft = "";
                    if (endsToRemove.length === 1 &&
                        prevStartsStr !== starts_1.toString() &&
                        starts_1.length - endsToRemove.length === 0) {
                        while (textTemp.startsWith(" ")) {
                            bef += " ";
                            textTemp = textTemp.slice(1);
                        }
                        while (textTemp.endsWith(" ")) {
                            aft += " ";
                            textTemp = textTemp.slice(0, -1);
                        }
                    }
                    var res_1 = {
                        type: "text",
                        value: textTemp,
                        color: cur.color
                    };
                    textTemp = "";
                    var startsReversed = starts_1.slice().reverse();
                    startsReversed.forEach(function (k) {
                        switch (k) {
                            case "inlineCode":
                                res_1 = {
                                    type: k,
                                    value: res_1.value,
                                };
                                break;
                            case "strong":
                            case "emphasis":
                            case "delete":
                                res_1 = {
                                    type: k,
                                    children: [res_1],
                                };
                                break;
                            case "color":
                                if (!res_1.children) {
                                    res_1 = {
                                        type: "text",
                                        color: res_1.color,
                                        value: res_1.value,
                                    };
                                }
                                break;
                        }
                    });
                    var arr = [];
                    if (bef.length > 0) {
                        arr.push({ type: "text", value: bef, color: cur.color });
                    }
                    arr.push(res_1);
                    if (aft.length > 0) {
                        arr.push({ type: "text", value: aft, color: cur.color });
                    }
                    mdastTexts.push.apply(mdastTexts, arr);
                }
                if (endsToRemove.length > 0) {
                    endsToRemove.reverse().forEach(function (e) {
                        starts_1.splice(e.index, 1);
                    });
                }
                else {
                    var payload = { type: "text", value: textTemp };
                    if (cur.color) {
                        payload.color = cur.color;
                    }
                    mdastTexts.push(payload);
                    textTemp = "";
                }
            };
            for (var j = 0; j < textQueue.length; j++) {
                _loop_2(j);
            }
            if (textTemp) {
                mdastTexts.push({ type: "text", value: textTemp });
                textTemp = "";
            }
            mdastNodes.push.apply(mdastNodes, mergeTexts(mdastTexts));
            textQueue = [];
            if (!n)
                return "continue";
            var node = createMdastNode(n);
            if (node) {
                if (!node.children.length) {
                    node.children.push({
                        type: 'text', value: "{{NewLine}}"
                    });
                }
                mdastNodes.push(node);
            }
        }
    };
    for (var i = 0; i <= nodes.length; i++) {
        _loop_1(i);
    }
    return mdastNodes;
}
function createMdastNode(node) {
    switch (node.type) {
        case "paragraph":
            return createParagraph(node);
        case "heading":
            return createHeading(node);
        case "thematicBreak":
            return createThematicBreak(node);
        case "blockquote":
            return createBlockquote(node);
        case "ordered-list":
        case "unordered-list":
            var clone = __assign({}, node);
            clone.ordered = node.type === "ordered-list";
            clone.type = "list";
            return createList(clone);
        case "list":
            return createList(node);
        case "list-item":
            var clone = __assign({}, node);
            clone.type = "listItem";
            return createListItem(clone);
        case "list-item-text":
            var clone = __assign({}, node);
            clone.type = "paragraph";
            return createParagraph(clone);
        case "listItem":
            return createListItem(node);
        case "table":
            return createTable(node);
        case "tableRow":
            return createTableRow(node);
        case "tableCell":
            return createTableCell(node);
        case "html":
            return createHtml(node);
        case "code":
            return createCode(node);
        case "yaml":
            return createYaml(node);
        case "toml":
            return createToml(node);
        case "definition":
            return createDefinition(node);
        case "footnoteDefinition":
            return createFootnoteDefinition(node);
        case "break":
            return createBreak(node);
        case "link":
            return createLink(node);
        case "image":
            return createImage(node);
        case "linkReference":
            return createLinkReference(node);
        case "imageReference":
            return createImageReference(node);
        case "footnote":
            return createFootnote(node);
        case "footnoteReference":
            return creatFootnoteReference(node);
        case "math":
            return createMath(node);
        case "inlineMath":
            return createInlineMath(node);
        case "custom":
            return node;
    }
    return null;
}
function isText(node) {
    return "text" in node;
}
function mergeTexts(nodes) {
    var res = [];
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var cur = nodes_1[_i];
        var last = res[res.length - 1];
        if (last && last.type === cur.type && last.color === cur.color) {
            if (last.type === "text") {
                last.value += cur.value;
            }
            else if (last.type === "inlineCode") {
                last.value += cur.value;
            }
            else {
                last.children = mergeTexts(last.children.concat(cur.children));
            }
        }
        else {
            if (cur.type === "text" && cur.value === "")
                continue;
            res.push(cur);
        }
    }
    return res;
}
function createParagraph(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$2(children),
    };
}
function createHeading(node) {
    var type = node.type, depth = node.depth, children = node.children;
    return {
        type: type,
        depth: depth,
        children: convertNodes$2(children),
    };
}
function createThematicBreak(node) {
    var type = node.type;
    return {
        type: type,
    };
}
function createBlockquote(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$2(children),
    };
}
function createList(node) {
    var type = node.type, ordered = node.ordered, start = node.start, spread = node.spread, children = node.children;
    return {
        type: type,
        ordered: ordered,
        start: start,
        spread: spread,
        children: convertNodes$2(children),
    };
}
function createListItem(node) {
    var type = node.type, checked = node.checked, spread = node.spread, children = node.children;
    return {
        type: type,
        checked: checked,
        spread: spread,
        children: convertNodes$2(children),
    };
}
function createTable(node) {
    var type = node.type, align = node.align, children = node.children;
    return {
        type: type,
        align: align,
        children: convertNodes$2(children),
    };
}
function createTableRow(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$2(children),
    };
}
function createTableCell(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$2(children),
    };
}
function createHtml(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        value: children[0].text,
    };
}
function createCode(node) {
    var type = node.type, lang = node.lang, meta = node.meta, children = node.children;
    return {
        type: type,
        lang: lang,
        meta: meta,
        value: children[0].text,
    };
}
function createYaml(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        value: children[0].text,
    };
}
function createToml(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        value: children[0].text,
    };
}
function createDefinition(node) {
    var type = node.type, identifier = node.identifier, label = node.label, url = node.url, title = node.title;
    return {
        type: type,
        identifier: identifier,
        label: label,
        url: url,
        title: title,
    };
}
function createFootnoteDefinition(node) {
    var type = node.type, identifier = node.identifier, label = node.label, children = node.children;
    return {
        type: type,
        identifier: identifier,
        label: label,
        children: convertNodes$2(children),
    };
}
function createBreak(node) {
    var type = node.type;
    return {
        type: type,
    };
}
function createLink(node) {
    var type = node.type, url = node.url, title = node.title, children = node.children;
    return {
        type: type,
        url: url,
        title: title,
        children: convertNodes$2(children),
    };
}
function createImage(node) {
    var type = node.type, url = node.url, title = node.title, alt = node.alt;
    return {
        type: type,
        url: url,
        title: title,
        alt: alt,
    };
}
function createLinkReference(node) {
    var type = node.type, identifier = node.identifier, label = node.label, referenceType = node.referenceType, children = node.children;
    return {
        type: type,
        identifier: identifier,
        label: label,
        referenceType: referenceType,
        children: convertNodes$2(children),
    };
}
function createImageReference(node) {
    var type = node.type, identifier = node.identifier, label = node.label, alt = node.alt, referenceType = node.referenceType;
    return {
        type: type,
        identifier: identifier,
        label: label,
        alt: alt,
        referenceType: referenceType,
    };
}
function createFootnote(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        children: convertNodes$2(children),
    };
}
function creatFootnoteReference(node) {
    var type = node.type, identifier = node.identifier, label = node.label;
    return {
        type: type,
        identifier: identifier,
        label: label,
    };
}
function createMath(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        value: children[0].text,
    };
}
function createInlineMath(node) {
    var type = node.type, children = node.children;
    return {
        type: type,
        value: children[0].text,
    };
}

var plugin$2 = function (settings) {
    // @ts-ignore
    return function (node) {
        return slateToMdast(node);
    };
};

function slate047ToSlate(nodes) {
    return convertNodes$1(nodes);
}
function convertNodes$1(nodes) {
    return nodes.reduce(function (acc, n) {
        var node = convert$1(n);
        if (node) {
            acc.push(node);
        }
        return acc;
    }, []);
}
function convert$1(node) {
    switch (node.object) {
        case "block": {
            var type = node.type, nodes = node.nodes, data = node.data;
            return __assign({ type: type, children: convertNodes$1(nodes) }, data);
        }
        case "inline": {
            var type = node.type, nodes = node.nodes, data = node.data;
            return __assign({ type: type, children: convertNodes$1(nodes) }, data);
        }
        case "text": {
            var _a = node.text, text = _a === void 0 ? "" : _a, marks = node.marks;
            return __assign({ text: text }, marks === null || marks === void 0 ? void 0 : marks.reduce(function (acc, m) {
                acc[m.type] = true;
                return acc;
            }, {}));
        }
    }
    return null;
}

var plugin$1 = function (settings) {
    // @ts-ignore
    return function (node) {
        return slateToMdast({
            type: "root",
            children: slate047ToSlate(node.children),
        });
    };
};

function slateToSlate047(nodes) {
    return {
        object: "value",
        document: {
            object: "document",
            nodes: convertNodes(nodes),
        },
    };
}
function convertNodes(nodes) {
    return nodes.reduce(function (acc, n) {
        var node = convert(n);
        if (node) {
            acc.push(node);
        }
        return acc;
    }, []);
}
function convert(node) {
    if ("text" in node) {
        var text = node.text, rest_1 = __rest(node, ["text"]);
        var marks = Object.keys(rest_1).reduce(function (acc, type) {
            if (!rest_1[type])
                return acc;
            acc.push({
                object: "mark",
                type: type,
            });
            return acc;
        }, []);
        var res = {
            object: "text",
            text: text,
            marks: marks,
        };
        return res;
    }
    switch (node.type) {
        case "paragraph":
        case "heading":
        case "blockquote":
        case "list":
        case "listItem":
        case "table":
        case "tableRow":
        case "tableCell":
        case "html":
        case "code":
        case "yaml":
        case "toml":
        case "thematicBreak":
        case "definition":
        case "break":
        case "math": {
            var type = node.type, children = node.children, rest = __rest(node, ["type", "children"]);
            var res = {
                object: "block",
                type: type,
                nodes: convertNodes(children),
                data: __assign({}, rest),
            };
            return res;
        }
        case "footnoteDefinition":
        case "link":
        case "linkReference":
        case "image":
        case "imageReference":
        case "footnote":
        case "footnoteReference":
        case "inlineMath": {
            var type = node.type, children = node.children, rest = __rest(node, ["type", "children"]);
            var res = {
                object: "inline",
                type: type,
                nodes: convertNodes(children),
                data: __assign({}, rest),
            };
            return res;
        }
    }
    return null;
}

function plugin() {
    // @ts-ignore
    this.Compiler = function (node) {
        return slateToSlate047(mdastToSlate(node));
    };
}

exports.mdastToSlate = mdastToSlate;
exports.remarkToSlate = plugin$3;
exports.remarkToSlateLegacy = plugin;
exports.slateToMdast = slateToMdast;
exports.slateToRemark = plugin$2;
exports.slateToRemarkLegacy = plugin$1;
