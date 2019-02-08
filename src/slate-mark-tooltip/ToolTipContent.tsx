import React from 'react';
import styled from 'styled-components';
import is from 'styled-is';

export interface IToolTipProps {
  wordType?: string;
  wordId?: number;
  conjugatedType?: string;
  posDetail1?: string;
  reading?: string;
  posDetail2?: string;
  posDetail3?: string;
  conjugatedForm?: string;
  value?: string;
  surfaceForm?: string;
  basicForm?: string;
  pos?: string;
  pronunciation?: string;
}

function hasValue(text?: string | void) {
  if (typeof text === 'string' && text !== '*') {
    return true;
  }
  return '';
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const BasicWordInfo = styled.span``;
const ConjugatedForm = styled.span`
  margin-right: 8px;
`;
const PartOfSpeech = styled.span`
  margin-left: 8px;
`;
const Conjugated = styled.span<{ displayed?: boolean | string }>`
  ${is('displayed')`
    margin-top: 5px;
  `}
`;
export default function ToolTipContent({
  value,
  pos,
  posDetail1,
  posDetail2,
  posDetail3,
  surfaceForm,
  basicForm,
  conjugatedForm,
  conjugatedType,
}: IToolTipProps) {
  // 当前接续形式
  const conjugatedFormDisplay = hasValue(conjugatedForm)
    ? `(${conjugatedForm})`
    : '';
  // 词类细节
  const posDetail = [posDetail1, posDetail2, posDetail3]
    .filter(hasValue)
    .join(', ');
  const posDetailDisplay = posDetail.length > 0 ? `<${posDetail}>` : '';
  const posDisplay = pos + posDetailDisplay;
  // ？？？
  const surface =
    surfaceForm !== value && hasValue(surfaceForm) ? `→ ${surfaceForm}` : '';
  const conjugatedTypeDisplay =
    hasValue(conjugatedType) && hasValue(basicForm) && basicForm !== value
      ? `${conjugatedType} ( ${basicForm} )`
      : '';
  return (
    <Container>
      <BasicWordInfo>
        {conjugatedFormDisplay && (
          <ConjugatedForm>{conjugatedFormDisplay}</ConjugatedForm>
        )}
        {value}
        {value && posDisplay && ': '}
        {posDisplay && <PartOfSpeech>{posDisplay}</PartOfSpeech>}
      </BasicWordInfo>
      <Conjugated displayed={conjugatedTypeDisplay || surface}>
        {conjugatedTypeDisplay} {surface}
      </Conjugated>
    </Container>
  );
}
