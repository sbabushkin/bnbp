import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BalirealtyService } from "./services/balirealty.service";
import { BaliHomeImmoService } from "./services/balihomeimmo.service";
import { BalivillasalesService } from "./services/balivillasales.service";
import { BaliexceptionService } from "./services/baliexception.service";
import { ParserController } from "./parser.controller";
import { BalimovesService } from "./services/balimoves.service";
import { ExcelbaliService } from "./services/excelbali.service";
import { PpbaliService } from "./services/ppbali.service";
import { HarcourtspurbabaliService } from "./services/harcourtspurbabali.service";
import { DotpropertyService } from "./services/dotproperty.service";
import { PropertiabaliService } from "./services/propertiabali.service";
import { BalitreasurepropertiesService } from "./services/balitreasureproperties.service";
import { FazwazService } from "./services/fazwaz.service";
import { UnikbalivillaService } from "./services/unikbalivilla.service";
import { RajavillapropertyService } from "./services/rajavillaproperty.service";
import { LazudiService } from "./services/lazudi.service";
import { BalicoconutlivingService } from "./services/balicoconutliving.service";
import { RumahService } from "./services/rumah.service";
import { AnniedeanpropertiesService } from "./services/anniedeanproperties.service";
import { PropertyResolver } from "./property.resolver";
import { ParserService } from "./parser.service";
import { PowerbaliService } from "./services/powerbali.service";

@Module({
  providers: [
    PropertyResolver,
    ParserService,
    BalirealtyService,
    BaliHomeImmoService,
    BaliexceptionService,
    BalivillasalesService,
    BalimovesService,
    ExcelbaliService,
    PpbaliService,
    HarcourtspurbabaliService,
    DotpropertyService,
    PropertiabaliService,
    BalitreasurepropertiesService,
    FazwazService,
    UnikbalivillaService,
    RajavillapropertyService,
    LazudiService,
    BalicoconutlivingService,
    RumahService,
    AnniedeanpropertiesService,
    PowerbaliService,
  ],
  imports: [
    DatabaseModule,
  ],
  controllers: [
    ParserController,
  ],
  exports: [BalirealtyService],
})
export class ParserModule {}
