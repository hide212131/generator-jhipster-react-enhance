import _ from 'lodash';
import { clientApplicationTemplatesBlock } from 'generator-jhipster/generators/client/support';
import { upperFirstCamelCase } from 'generator-jhipster/generators/base/support';

export const reactFiles = {
  test: [
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-update.spec.tsx',
        'entities/_entityFolder_/_entityFile_.test-samples.ts',
        'entities/entities-test-utils.tsx',
      ],
    },
  ],
};

const createRelationshipsCotext = differentRelationships => {
  let hasRelationshipQuery = false;
  const otherEntityActions = [];
  const manyToManyOwners = new Set();
  const relFieldNames = new Set();
  const uniqueRelationFields = new Set();

  Object.keys(differentRelationships).forEach(key => {
    const hasAnyRelationshipQuery = differentRelationships[key].some(
      rel => (rel.relationshipOneToOne && rel.ownerSide && !rel.otherEntityUser) || !rel.relationshipOneToMany,
    );
    if (hasAnyRelationshipQuery) {
      hasRelationshipQuery = true;
      differentRelationships[key].forEach(rel => {
        if (rel.relationshipManyToMany && rel.ownerSide) {
          manyToManyOwners.add(rel);
        } else {
          relFieldNames.add(rel);
        }
      });
    }
    if (differentRelationships[key].some(rel => !rel.relationshipOneToMany)) {
      const uniqueRel = differentRelationships[key][0];
      uniqueRelationFields.add(uniqueRel.otherEntityNamePlural);
      otherEntityActions.push({
        url: _.kebabCase(uniqueRel.otherEntityNamePlural),
        action: `get${upperFirstCamelCase(uniqueRel.otherEntityNamePlural)}`,
        instance: `${uniqueRel.otherEntityNamePlural}`,
        entity: uniqueRel.otherEntityName,
        reducer: uniqueRel.otherEntity.builtInUser
          ? `userManagement.${uniqueRel.otherEntityNamePlural}`
          : `${uniqueRel.otherEntity.entityReactState}.entities`,
      });
    }
  });

  return {
    hasRelationshipQuery,
    otherEntityActions,
    manyToManyOwners,
    relFieldNames,
    uniqueRelationFields,
  };
};

export async function writeEntitiesFiles({ application, entities }) {
  for (const entity of entities.filter(entity => !entity.skipClient && !entity.builtIn)) {
    // eslint-disable-next-line no-await-in-loop
    await this.writeFiles({
      sections: reactFiles,
      context: { ...application, ...entity, ...createRelationshipsCotext(entity.differentRelationships) },
    });
  }
}
