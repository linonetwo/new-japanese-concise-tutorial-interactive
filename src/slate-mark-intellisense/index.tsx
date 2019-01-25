import React, { ReactNode } from 'react';
import { Editor, Plugin } from 'slate-react';
import { Mark, MarkJSON } from 'slate';
import Tooltip from 'react-tooltip';
import styled, { createGlobalStyle } from 'styled-components';
import ToolTipContent, { IToolTipProps } from './ToolTipContent';

const ToolTipStyle = createGlobalStyle`
  #slate-mark-intellisense {
    /* move it down, near the text */
    margin-top: 0px;
    /* remove triangle */
    &:after {
      border: none;
    }
  }
`;
const IntellisenseMark = styled.mark`
  background-color: transparent;
`;
export default function MarkIntellisense(): Plugin {
  return {
    renderEditor(props, editor, next) {
      const children = next();
      return (
        <>
          {children}
          <ToolTipStyle />
          <Tooltip
            id="slate-mark-intellisense"
            effect="solid"
            delayShow={70}
            delayUpdate={10}
            getContent={(marksString: string | null) => {
              if (!marksString) {
                return;
              }
              const mark: MarkJSON & { data: IToolTipProps } = JSON.parse(marksString);
              return <ToolTipContent {...mark.data} />;
            }}
          />
        </>
      );
    },
    renderMark(props, editor, next): ReactNode | void {
      const { children, mark, attributes } = props;
      return (
        <IntellisenseMark
          data-tip={JSON.stringify(mark)}
          data-for="slate-mark-intellisense"
          onMouseEnter={Tooltip.rebuild}
          {...attributes}
        >
          {children}
        </IntellisenseMark>
      );
    },
  };
}
