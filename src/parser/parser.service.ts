import { Injectable } from "@nestjs/common";
import { BaliHomeImmoService } from "./services/balihomeimmo.service";
import { BaliexceptionService } from "./services/baliexception.service";
import { BalivillasalesService } from "./services/balivillasales.service";
import { BalirealtyService } from "./services/balirealty.service";
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
import { ExotiqpropertyService } from "./services/exotiqproperty.service";
import { VillabalisaleService } from "./services/villabalisale.service";
import { SuasarealestateService } from "./services/suasarealestate.service";
import { PowerbaliService } from "./services/powerbali.service";
import { OptimumbaliService } from "./services/optimumbali.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import {Property} from "./entities/property.entity";

const everySundayCronExp = '0 0 * * 0';

@Injectable()
export class ParserService {

	constructor(
		private readonly baliHomeImmoService: BaliHomeImmoService,
		private readonly baliexceptionService: BaliexceptionService,
		private readonly balivillasalesService: BalivillasalesService,
		private readonly balirealtyService: BalirealtyService,
		private readonly balimovesService: BalimovesService,
		private readonly excelbaliService: ExcelbaliService,
		private readonly ppbaliService: PpbaliService,
		private readonly harcourtspurbabaliService: HarcourtspurbabaliService,
		private readonly dotpropertyService: DotpropertyService,
		private readonly propertiabaliService: PropertiabaliService,
		private readonly balitreasurepropertiesService: BalitreasurepropertiesService,
		private readonly fazwazService: FazwazService,
		private readonly unikbalivillaService: UnikbalivillaService,
		private readonly rajavillapropertyService: RajavillapropertyService,
		private readonly lazudiService: LazudiService,
		private readonly balicoconutlivingService: BalicoconutlivingService,
		private readonly rumahService: RumahService,
		private readonly anniedeanpropertiesService: AnniedeanpropertiesService,
		private readonly exotiqpropertyService: ExotiqpropertyService,
		private readonly villabalisaleService: VillabalisaleService,
		private readonly suasarealestateService: SuasarealestateService,
		private readonly powerbaliService: PowerbaliService,
		private readonly optimumbaliService: OptimumbaliService,
	) {}

	async parseInner(source: string) {
		let data = 'not found';

		switch(source) {
			case 'balihomeimmo':
				data = await this.baliHomeImmoService.parse();
				break;
			case 'baliexception':
				data = await this.baliexceptionService.parse();
				break;
			case 'balivillasales':
				data = await this.balivillasalesService.parse();
				break;
			case 'balirealty':
				data = await this.balirealtyService.parse();
				break;
			case 'balimoves':
				data = await this.balimovesService.parse();
				break;
			case 'excelbali':
				data = await this.excelbaliService.parse();
				break;
			case 'ppbali':
				data = await this.ppbaliService.parse();
				break;
			case 'harcourtspurbabali':
				data = await this.harcourtspurbabaliService.parse();
				break;
			case 'dotproperty':
				data = await this.dotpropertyService.parse();
				break;
			case 'propertiabali':
				data = await this.propertiabaliService.parse();
				break;
			case 'balitreasureproperties':
				data = await this.balitreasurepropertiesService.parse();
				break;
			case 'fazwaz':
				data = await this.fazwazService.parse();
				break;
			case 'unikbalivilla':
				data = await this.unikbalivillaService.parse();
				break;
			case 'rajavillaproperty':
				data = await this.rajavillapropertyService.parse();
				break;
			case 'lazudi':
				data = await this.lazudiService.parse();
				break;
			case 'balicoconutliving':
				data = await this.balicoconutlivingService.parse();
				break;
			case 'rumah':
				data = await this.rumahService.parse();
				break;
			case 'anniedeanproperties':
				data = await this.anniedeanpropertiesService.parse();
				break;
			case 'exotiqproperty':
				data = await this.exotiqpropertyService.parse();
				break;
			case 'optimumbali':
				data = await this.optimumbaliService.parse();
				break;
			case 'villabalisale':
				data = await this.villabalisaleService.parse();
				break;
			case 'suasarealestate':
				data = await this.suasarealestateService.parse();
				break;
			case 'powerbali':
				data = await this.powerbaliService.parse();
				break;
		}
	}

	@Cron(everySundayCronExp)
	async parseAll() {
		const sources = [
			'balihomeimmo',
			'baliexception',
			'balivillasales',
			'balirealty',
			'balimoves',
			'excelbali',
			'ppbali',
			'harcourtspurbabali',
			'dotproperty',
			'propertiabali',
			'balitreasureproperties',
			'fazwaz',
			'unikbalivilla',
			'rajavillaproperty',
			'lazudi',
			'balicoconutliving',
			'rumah',
			'anniedeanproperties',
			'exotiqproperty',
			'optimumbali',
			'villabalisale',
			'suasarealestate',
			'powerbali',
		];

		for (const source of sources) {
			try {
				await this.parseInner(source);
			} catch (e) {
				console.error(source, e.message);
			}
		}

		return 'ok';
	}

	async update(input: any) {
		return Property.query().patchAndFetchById(input.id, input);
	}
}
