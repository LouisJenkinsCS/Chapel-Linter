'use babel';

/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { CompositeDisposable } from 'atom';
/* eslint-enable import/no-extraneous-dependencies, import/extensions */

// Internal variables
let helpers = null;
let executablePath;

export default {
  activate() {
    console.log("Hello World!");
    require('atom-package-deps').install('linter-chapel');
    const linterName = 'linter-chapel';

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.config.observe(`${linterName}.executablePath`, (value) => {
        executablePath = value;
        console.log(value);
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    console.log("Provide linter...");
    return {
      grammarScopes: ['source.chapel'],
      scope: 'file',
      lintOnFly: false,
      lintsOnChange: false,
      timeout: 3000,
      name: 'ChapelLinter',
      async lint(editor) {
        console.log("Asked to lint...");
        if (!helpers) {
          helpers = require('atom-linter');
        }
        const regex = '(?<file>.+):(?<line>.+): (?<type>.+): (?<message>.+)';
        const file = editor.getPath();
        const text = editor.getText();
        console.log(file);
        console.log(text);

        options = {};
        options.timeout = Infinity;
        options.ignoreExitCode = true;
        var flags = [
          file, "--no-codegen", "--baseline", "--ignore-user-errors",
          "--devel", "--stop-after-pass=\"checkResolved\""
        ];
        return await helpers.exec(executablePath, flags, options).catch((output) => {
          console.log("Output: " + ("" + output).substring(7))
          if (editor.getText() !== text) {
            // Editor contents changed, tell Linter not to update
            return null;
          }

          const errors = helpers.parse(("" + output).substring(7), regex).map((parsed) => {
            console.log(parsed);
            const message = Object.assign({}, parsed);
            const line = message.range[0][0];
            message.range = helpers.generateRange(editor, line, -1);
            return message;
          });

          return errors;
        });
      },
    };
  },
};
