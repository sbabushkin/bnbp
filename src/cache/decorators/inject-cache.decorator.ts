import { Inject } from '@nestjs/common';

export const CACHE_SERVICE = 'CACHE_SERVICE';
export const InjectCache = () => Inject(CACHE_SERVICE);
