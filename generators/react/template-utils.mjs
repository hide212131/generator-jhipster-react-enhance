/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { generateTestEntityId } from 'generator-jhipster/generators/client/support';

/**
 * Generate a test entity, according to the references
 *
 * @param references
 * @param additionalFields
 * @return {String} test sample
 */
// eslint-disable-next-line import/prefer-default-export
export const generateTypescriptTestEntity = references => {
  const entries = references
    .map(reference => {
      if (reference.field) {
        const { field } = reference;
        const { fieldIsEnum, fieldTypeTimed, fieldTypeLocalDate, fieldWithContentType, fieldName, contentTypeFieldName } = field;

        const fakeData = field.generateFakeData('ts');
        if (fieldWithContentType) {
          return [
            [fieldName, fakeData],
            [contentTypeFieldName, "'unknown'"],
          ];
        }
        if (fieldIsEnum) {
          return [[fieldName, fakeData]];
        }
        if (fieldTypeTimed || fieldTypeLocalDate) {
          return [[fieldName, `dayjs(${fakeData})`]];
          // return [[fieldName, `'${fakeData.replace(/'/g, '')}:00.000Z'`]]; // for React
        }
        return [[fieldName, fakeData]];
      }
      return [[reference.name, generateTestEntityId(reference.type, 'random', false)]];
    })
    .flat();
  // for reusing entries.
  return entries;
  // return `{
  //   ${[...entries, ...Object.entries(additionalFields)].map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
  // }`;
};
