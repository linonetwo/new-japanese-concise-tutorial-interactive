import { camelCase, mapKeys } from 'lodash';
import { Root } from 'nlcst-types';
import { Node, Parent } from 'unist-types';
import { Decoration } from 'slate';
import { Plugin } from 'slate-react';

function isInstanceOfParent(node: Node): node is Parent {
  return 'children' in node;
}

export interface IOption {
  nodeTypes?: string[];
  parser: { parse(text: string): Root };
}
export default function MarkParsed(options: IOption): Plugin {
  const {
    nodeTypes = ['paragraph', 'line'],
    parser = {
      parse: () => ({
        type: 'RootNode',
        children: [],
      }),
    },
  } = options;
  return {
    decorateNode(node, editor, next) {
      const otherDecorations = next() || [];
      if (
        nodeTypes.length === 0 ||
        !('type' in node) ||
        !nodeTypes.includes(node.type)
      ) {
        return otherDecorations;
      }

      //
      const textNodes = node.getTexts().toArray();
      const text = textNodes.map(t => t.text).join('\n');
      const CST = parser.parse(text);
      let tokenQueue: Node[] = [CST];
      const decorations: Decoration[] = [];

      while (tokenQueue.length > 0) {
        const token = tokenQueue.shift();
        if (token === undefined) {
          continue;
        }
        if (isInstanceOfParent(token)) {
          tokenQueue = token.children.concat(tokenQueue);
        }
        if ('data' in token && 'position' in token && token.position) {
          // ignore word node that have exactly one text node, it and its text node are basically the same
          if (token.type === 'WordNode' && token.children.length === 1) {
            continue;
          }
          // seems one line one text, so we just get first text's key for now
          const decorator = {
            anchor: {
              key: textNodes[0].key,
              offset: token.position.start.offset,
              object: 'point' as 'point',
            },
            focus: {
              key: textNodes[0].key,
              offset: token.position.end.offset,
              object: 'point' as 'point',
            },
            mark: {
              type: token.type,
              data: {
                ...mapKeys(token.data, (_, key) => camelCase(key)),
                value: token.value,
              },
              object: 'mark' as 'mark',
            },
          };

          decorations.push(Decoration.fromJSON(decorator));
        }
      }

      return [...otherDecorations, ...decorations];
    },
  };
}
