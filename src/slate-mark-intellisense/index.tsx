import React, { ReactNode } from 'react';
import { Editor, Plugin } from 'slate-react';
import { Mark } from 'slate';
import styled from 'styled-components';

const IntellisenseMark = styled.mark`
  background-color: rgba(100, 100, 100, 0.5);
`;
export default function MarkIntellisense(): Plugin {
  return {
    renderMark(props, editor, next): ReactNode | void {
      const { children, mark, attributes } = props;
      return <IntellisenseMark {...attributes}>{children}</IntellisenseMark>;
    },
  };
}
