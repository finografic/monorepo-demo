import type { Prompt } from '@workspace/shared';

import { changeAddressPrompt } from './change-address.prompt';
import { finePaymentPrompt } from './fine-payment.prompt';
import { licenceRenewalPrompt } from './licence-renewal.prompt';
import { registrationRenewalPrompt } from './registration-renewal.prompt';
import { serviceFinderPrompt } from './service-finder.prompt';

export const PROMPTS: Prompt[] = [
  registrationRenewalPrompt,
  licenceRenewalPrompt,
  changeAddressPrompt,
  finePaymentPrompt,
  serviceFinderPrompt,
];
