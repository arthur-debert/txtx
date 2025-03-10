# Welcome to your VS Code Extension

## What's in the folder

- This folder contains all of the files necessary for your extension.
- `package.json` - this is the manifest file in which you declare your language
  support and define the location of the grammar file.
- `syntaxes/txtdoc.tmLanguage.json` - this is the TextMate grammar file that is
  used for tokenization.
- `language-configuration.json` - this is the language configuration, defining
  the tokens that are used for comments and brackets.

## Get up and running straight away

- Make sure the language configuration settings in `language-configuration.json`
  are accurate.
- Press `F5` to open a new window with your extension loaded.
- Create a new file with a file name suffix matching your language.
- Verify that syntax highlighting works and that the language configuration
  settings are working.

## Make changes

- You can relaunch the extension from the debug toolbar after making changes to
  the files listed above.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your
  extension to load your changes.

## Add more language features

- To add features such as IntelliSense, hovers and validators check out the VS
  Code extenders documentation at [https://code.visualstudio.com/docs](https://code.visualstudio.com/docs)

## Install your extension

- To start using your extension with Visual Studio Code copy it into the
  `<user home>/.vscode/extensions` folder and restart Code.
- To share your extension with the world, read about publishing an extension at
  [https://code.visualstudio.com/docs/editor/extension-gallery](https://code.visualstudio.com/docs/editor/extension-gallery)

## Run tests

- Open the debug viewlet (`Ctrl+Shift+D` or `Cmd+Shift+D` on Mac) and from the
  launch configuration dropdown pick `Extension Tests`.
- Press `F5` to run the tests in a new window with your extension loaded.
- See the output of the test result in the debug console.
- Make changes to `test/extension.test.js` or create new test files inside the
  `test` folder.
  - By convention, the test runner will only consider files matching the name
    pattern `**.test.js`.
  - You can create folders inside the `test` folder to structure your tests any
    way you want.
