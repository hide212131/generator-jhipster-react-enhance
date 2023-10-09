import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import command from './command.mjs';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.asInitializingTaskGroup({
      async initializingTemplateTask() {
        this.parseJHipsterArguments(command.arguments);
        this.parseJHipsterOptions(command.options);
      },
    });
  }

  // eslint-disable-next-line class-methods-use-this
  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async packageJson() {
        this.editFile('package.json', content =>
          content.includes('@testing-library/jest-dom')
            ? content
            : content.replace(
                /^(.+?devDependencies": \{)(.+)$/ms,
                `$1
                "@testing-library/jest-dom": "6.1.3",
                "@testing-library/user-event": "14.5.1",
                "msw": "1.3.2",
                "pluralize": "^8.0.0",
                $2`,
              ),
        );
      },
      async tsConfigTestJson() {
        this.editFile('tsconfig.test.json', content =>
          content.includes('"i18n/*": ["src/main/webapp/i18n/*"]')
            ? content
            : content.replace(
                '"app/*": ["src/main/webapp/app/*"]',
                `"app/*": ["src/main/webapp/app/*"],
                "i18n/*": ["src/main/webapp/i18n/*"]`,
              ),
        );
      },
    });
  }
}
