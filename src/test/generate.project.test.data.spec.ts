import { TestingModule } from '@nestjs/testing';
import { sample } from 'lodash';
import { executionTimeout, prepareTestingModule } from './helper';
import { createManufacturer } from '../manufacturer/manufacturer.service.spec';
import { ManufacturerStatusEnum } from '../manufacturer/manufacturer.enum';
import { createMaterialGroup } from '../material-group/material-group.service.spec';
import { MaterialGroupStatusEnum, MaterialGroupTypeEnum } from '../material-group/material-group.enum';
import { createMaterial } from '../material/material.service.spec';
import { MaterialStatusEnum } from '../material/material.enum';
import { createOneCMaterial } from '../one-c/material/one-c-material.service.spec';
import { generateArrayAsync } from '../util/array';
import { Manufacturer } from '../manufacturer/entities/manufacturer.entity';
import { MaterialGroup } from '../material-group/entities/material-group.entity';
import { OneCMaterial } from '../one-c/material/one-c-material.entity';
import { Material } from '../material/entities/material.entity';
import { createContractor } from '../contractor/contractor.service.spec';
import { ContractorStatusEnum } from '../contractor/contractor.enum';
import { OneCContractor } from '../one-c/contractor/one-c-contractor.entity';
import { createOneCContractor } from '../one-c/contractor/one-c-contractor.service.spec';
import { ContractorMaterial } from '../contractor-material/entities/contractor-material.entity';
import { createContractorMaterial } from '../contractor-material/contractor-material.service.spec';
import { ContractorMaterialStatusEnum } from '../contractor-material/contactor-material.enum';
import { Contractor } from '../contractor/entities/contractor.entity';
import { Tool } from '../tool/entities/tool.entity';
import { createTool } from '../tool/tool.service.spec';
import { ToolStatusEnum } from '../tool/tool.enum';

describe('GenerateProjectTestData', () => {
  let module: TestingModule;
  prepareTestingModule((value: TestingModule) => {
    module = value;
  });

  // Используется, чтобы сегенерить данные. Не должно входить в ci
  it.skip('GenerateProjectTestData', async () => {
    const generation = 0; // это значение стоит увеличивать на 1 после каждой генерации, чтобы данные не пересекались
    const baseCount = 5;
    const endCount = 20;
    const baseOffset = baseCount * generation;
    const endOffset = endCount * generation;

    const manufacturers: Manufacturer[] = await generateArrayAsync<Manufacturer>(baseCount, async (index) => {
      const count = baseOffset + index;
      const [result] = await createManufacturer(module, {
        name: `Производитель ${count}`,
        status: ManufacturerStatusEnum.active,
      });

      return result;
    });

    const materialGroups: MaterialGroup[] = await generateArrayAsync<MaterialGroup>(baseCount, async (index) => {
      const count = baseOffset + index;
      const [result] = await createMaterialGroup(module, {
        name: `Категория материалов ${count}`,
        type: MaterialGroupTypeEnum.finishing,
        status: MaterialGroupStatusEnum.active,
      });

      return result;
    });

    const oneCMaterials: OneCMaterial[] = await generateArrayAsync<OneCMaterial>(endCount, async (index) => {
      const count = endOffset + index;
      const [result] = await createOneCMaterial(module, {
        name: `Материал 1С ${count}`,
        active: true,
        unit: 'кг',
      });

      return result;
    });

    const materials: Material[] = [];
    for (const m of oneCMaterials) {
      const [result] = await createMaterial(module, {
        status: MaterialStatusEnum.active,
        externalIdOneC: m.id,
        materialGroupId: sample(materialGroups).id,
        manufacturerId: sample(manufacturers).id,
        unitId: 21,
      });

      materials.push(result);
    }

    const oneCContractors: OneCContractor[] = await generateArrayAsync<OneCContractor>(endCount, async (index) => {
      const count = endOffset + index;
      const [result] = await createOneCContractor(module, {
        active: true,
        name: `Поставщик ${count}`,
        inn: `ИНН ${count}`,
        type: `Тип ${count}`,
        okpo: `ОКПО ${count}`,
        kpp: `КПП ${count}`,
        phoneNumber: `Телефон ${count}`,
        email: `email ${count}`,
        legalAddress: `ЮР адрес ${count}`,
        actualAddress: `физ адрес ${count}`,
      });

      return result;
    });

    const contractors: Contractor[] = [];
    for (const c of oneCContractors) {
      const [result] = await createContractor(module, {
        externalIdOneC: c.id,
        status: ContractorStatusEnum.active,
        approvedByPik: true,
      });

      contractors.push(result);
    }

    await generateArrayAsync<ContractorMaterial>(endCount, async (index) => {
      const count = endOffset + index;
      const [result] = await createContractorMaterial(module, {
        materialId: sample(materials).id,
        contractorId: sample(contractors).id,
        status: ContractorMaterialStatusEnum.active,
        vendorCode: `Артикул ${count}`,
        price: count + 100 + count,
      });

      return result;
    });

    await generateArrayAsync<Tool>(endCount, async (index) => {
      const count = endOffset + index;
      const [result] = await createTool(module, {
        name: `Инструмент ${count}`,
        status: ToolStatusEnum.active,
        manufacturerId: sample(manufacturers).id,
      });

      return result;
    });
  }, executionTimeout);
});
