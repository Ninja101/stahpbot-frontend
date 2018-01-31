/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

// import { OpaqueToken } from '@angular/core';

import { LANG_EN_NAME, LANG_EN_TRANS } from './lang-en';
import { LANG_FR_NAME, LANG_FR_TRANS } from './lang-fr';
import { LANG_DE_NAME, LANG_DE_TRANS } from './lang-de';
import { LANG_RU_NAME, LANG_RU_TRANS } from './lang-ru';
import { LANG_SE_NAME, LANG_SE_TRANS } from './lang-se';

// export const TRANSLATIONS = new OpaqueToken( 'translations' );

export const Dictionary: any = {
    [LANG_EN_NAME]: LANG_EN_TRANS,
    [LANG_FR_NAME]: LANG_FR_TRANS,
    [LANG_DE_NAME]: LANG_DE_TRANS,
    [LANG_RU_NAME]: LANG_RU_TRANS,
    [LANG_SE_NAME]: LANG_SE_TRANS,
};

/*export const TRANSLATION_PROVIDERS = {
	provide: TRANSLATIONS, useValue: Dictionary
};*/