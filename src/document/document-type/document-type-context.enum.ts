import { registerEnumType } from '@nestjs/graphql';

// Типы документов: КС2, КС3, управленческое выполнение
export enum DocumentTypeContextEntityTypeEnum {
  managerialExecution = 'managerialExecution',
  ks2 = 'ks2',
}

// В будущем сделаем хэш-таблицу, с доступными entity контекста
/*
const classMap: Map<DocumentTypeContextEntityTypeEnum, Array<typeof BaseModel>> = new Map();
classMap.set(DocumentTypeContextEntityTypeEnum.managerialExecution, [RoomWorkSiteTask]);
classMap.set(DocumentTypeContextEntityTypeEnum.ks2, [RoomWorkSiteTask]);

export const entityTypeClassMap = classMap;
*/

registerEnumType(DocumentTypeContextEntityTypeEnum, {
  name: 'DocumentContextEntityTypeEnum',
});
