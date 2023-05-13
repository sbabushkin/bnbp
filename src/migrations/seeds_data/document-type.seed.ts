import { DocumentTypeContextEntityTypeEnum } from '../../document/document-type/document-type-context.enum';

const date = new Date().toISOString();

export const documentTypeSeed = [
  {
    context: DocumentTypeContextEntityTypeEnum.managerialExecution,
    name: 'Управленческое выполнение',
    description: 'Описание вида документа',
    created: date,
    updated: date,
  },
];
