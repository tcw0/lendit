/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimespanDto } from './TimespanDto';
import type { WeekdayEnum } from './WeekdayEnum';

export type AvailabilityDto = {
    whitelist: Array<TimespanDto>;
    blacklist: Array<TimespanDto>;
    availableWeekdays: Array<WeekdayEnum>;
};

