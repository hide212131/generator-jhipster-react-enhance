import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
// import { clientFrameworkTypes } from 'generator-jhipster/jdl/jhipster';
// import { generateEntityClientEnumImports as getClientEnumImportsFormat } from 'generator-jhipster/generators/client/support';
// eslint-disable-next-line import/extensions
import dayjs from 'dayjs';
// eslint-disable-next-line import/extensions
import { generateTypescriptTestEntity as generateTestEntity } from './template-utils.mjs';
// eslint-disable-next-line import/extensions
import { writeEntitiesFiles } from './entity-files-react.mjs';

// const { REACT } = clientFrameworkTypes;
export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  get writingEntities() {
    return {
      writeEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  // eslint-disable-next-line class-methods-use-this
  generateTypescriptTestEntity(references, additionalFields) {
    return generateTestEntity(references, additionalFields);
  }

  /**
   * see generator-jhipster:generators/client/support/template-utils.mjs
   */
  // eslint-disable-next-line class-methods-use-this
  generateTypescriptTestEntityForRelationships(relReferences) {
    const result = {};
    relReferences.forEach((reference, index) => {
      result[reference.name] = { id: index };
    });
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  generateTypescriptTestFormForRelationships(relReferences) {
    const result = {};
    relReferences.forEach((reference, index) => {
      result[reference.name] = index;
    });
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  generateEntityReferences(fields, relationships = []) {
    const fieldReferences = fields.map(field => field.reference);
    const relReferences = relationships
      .filter(
        rel => rel.relationshipManyToOne || (rel.relationshipOneToOne && rel.ownerSide) || (rel.relationshipManyToMany && rel.ownerSide),
      )
      .map(field => field.reference);
    return { fieldReferences, relReferences };
  }

  generateEntries({ fieldReferences, relReferences = [] }) {
    const entries = this.generateTypescriptTestEntity(fieldReferences);
    const relEntries = relReferences.map((ref, index) => [ref.name, { id: index }]);
    return [...entries, ...relEntries];
  }

  generateFullEntries(fields, relationships) {
    const refs = this.generateEntityReferences(
      fields.filter(field => !field.id),
      relationships,
    );
    const entries = this.generateEntries(refs);
    return { entries, refs };
  }

  generatePerticalEntries(fields, faker) {
    let perticalFields = fields.filter(
      field => !field.id && (field.fieldValidationRequired || (!field.transient && faker.datatype.boolean())),
    );
    // If perticalFields is empty, ensure it contains at least one element.
    if (perticalFields.length === 0) {
      perticalFields = fields.filter(field => !field.id && (field.fieldValidationRequired || !field.transient)).slice(0, 1);
    }
    const refs = this.generateEntityReferences(perticalFields);
    const entries = this.generateEntries(refs);
    return { entries, refs };
  }

  // eslint-disable-next-line class-methods-use-this
  formatPayloadField(entries, { fieldReferences, relReferences = [] }) {
    const payloadData = [];

    fieldReferences.forEach(ref => {
      const entry = entries.find(([key]) => key === ref.name);
      payloadData.push(entry);
    });
    relReferences.forEach(ref => {
      const entry = entries.find(([key]) => key === ref.name);
      const [key, value] = entry;
      if (typeof value === 'object') {
        if (ref.relationship.relationshipType === 'many-to-many') {
          payloadData.push([key, `[{ id : ${value.id} }]`]);
        } else {
          payloadData.push([key, `{ id : ${value.id} }`]);
        }
      } else {
        payloadData.push(entry);
      }
    });

    return `{
      ${payloadData.map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
    }`;
  }

  // eslint-disable-next-line class-methods-use-this
  formatFormField(entries, { fieldReferences, relReferences = [] }) {
    const formData = [];

    fieldReferences.forEach(ref => {
      const entry = entries.find(([key]) => key === ref.name);
      const [key, value] = entry;
      if (ref.field.fieldType === 'Instant') {
        formData.push([key, `'${dayjs(value.replace(/'/g, '')).format('YYYY-MM-DDTHH:mm')}'`]);
      } else if (ref.field.fieldType === 'Long') {
        formData.push([key, `'${value}'`]);
      } else {
        formData.push(entry);
      }
    });
    relReferences.forEach(ref => {
      const entry = entries.find(([key]) => key === ref.name);
      const [key, value] = entry;
      if (ref.relationship.relationshipType === 'many-to-many') {
        formData.push([key, `['${value.id}']`]);
      } else {
        formData.push([key, `'${value.id}'`]);
      }
    });

    return `{
      ${formData.map(([key, value]) => `${key}: ${value}`).join(',\n  ')}
   }`;
  }
}
