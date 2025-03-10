// The module 'vscode' contains the VS Code extensibility API
const vscode = require("vscode");
const path = require("path");

// Regular expressions for matching different elements
const SECTION_REGEX = /^([A-Z][^\n]*)$/gm;
const CODE_BLOCK_START_REGEX = /^(\s{4}.*)/gm;
const QUOTE_REGEX = /^>\s+(.+)$/gm;
const NESTED_QUOTE_REGEX = /^>>\s+(.+)$/gm;

// Arrow transformation mappings
const ARROW_TRANSFORMATIONS = [
    { pattern: /->(?!\w)/g, replacement: '→' }, // Right arrow
    { pattern: /<-(?!\w)/g, replacement: '←' }, // Left arrow
    { pattern: /\^-(?!\w)/g, replacement: '↑' }, // Up arrow
    { pattern: /v-(?!\w)/g, replacement: '↓' }  // Down arrow
];

// Emoticon mappings
const EMOTICONS = [
    { name: "Smiley, happy face", emoticon: "🙂" },
    { name: "Laughing, big grin, grinning with glasses", emoticon: "😄" },
    { name: "Laughing", emoticon: "😂" },
    { name: "Very happy or double chin", emoticon: ":-)" },
    { name: "Frown, sad, pouting", emoticon: "☹️" },
    { name: "Crying", emoticon: "😢" },
    { name: "Tears of happiness", emoticon: "🥲" },
    { name: "Angry", emoticon: "😠" },
    { name: "Horror, disgust, sadness, great dismay", emoticon: "😫" },
    { name: "Surprise, shock", emoticon: "😮" },
    { name: "Cat face, curled mouth, cutesy, playful, mischievous", emoticon: "😺" },
    { name: "Lion smile, evil cat, playfulness", emoticon: "😼" },
    { name: "Kiss", emoticon: "😘" },
    { name: "Wink, smirk", emoticon: "😉" },
    { name: "Tongue sticking out, cheeky/playful, blowing a raspberry", emoticon: "😛" },
    { name: "Skeptical, annoyed, undecided, uneasy, hesitant", emoticon: "🤔" },
    { name: "Straight face, no expression, indecision", emoticon: "😐" },
    { name: "Embarrassed, blushing", emoticon: "😳" },
    { name: "Sealed lips, wearing braces, tongue-tied", emoticon: "🤐" },
    { name: "Angel, halo, saint, innocent", emoticon: "😇" },
    { name: "Evil, devilish", emoticon: "😈" },
    { name: "Cool, bored, yawning", emoticon: "😎" },
    { name: "Tongue-in-cheek", emoticon: "😏" },
    { name: "Partied all night", emoticon: "🥴" },
    { name: "Drunk, confused", emoticon: "😵" },
    { name: "Being sick", emoticon: "🤒" },
    { name: "Dumb, dunce-like", emoticon: "<:-|" },
    { name: "Scepticism, disbelief, disapproval", emoticon: "🤨" },
    { name: "Grimacing, nervous, awkward", emoticon: "😬" },
    { name: "Skull and crossbones", emoticon: "💀" },
    { name: "Chicken", emoticon: "🐔" },
    { name: "Shrugs", emoticon: "¯\\_(ツ)_/¯" }
];

// Create a map for quick lookup by partial name
const EMOTICON_MAP = new Map();
EMOTICONS.forEach(item => {
    // Add the full name
    EMOTICON_MAP.set(item.name.toLowerCase(), item);
    
    // Add each word in the name as a separate entry
    const words = item.name.toLowerCase().split(/[,\s]+/);
    words.forEach(word => {
        if (word.length > 2) { // Only add words with more than 2 characters
            if (!EMOTICON_MAP.has(word)) {
                EMOTICON_MAP.set(word, item);
            }
        }
    });
});

// Regular expression to match emoticon search pattern
const EMOTICON_SEARCH_REGEX = /:([a-zA-Z0-9_]+)/g;

// Keep track of active emoticon search
let activeEmoticonSearch = null;
let emoticonSearchDecorationType = null;
let emoticonQuickPick = null;

// Path completion trigger characters
const PATH_COMPLETION_TRIGGERS = ['/'];

let outputChannel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('txtos');
    context.subscriptions.push(outputChannel);
    
    // Log activation
    outputChannel.appendLine('TxtDoc Format extension is now active!');
    outputChannel.appendLine(`Activated at: ${new Date().toLocaleString()}`);
    
    // Register document symbol provider for outline support
    const documentSymbolProvider = new TxtDocDocumentSymbolProvider();
    const selector = { language: 'txtdoc', scheme: 'file' };
    
    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(selector, documentSymbolProvider)
    );
    
    outputChannel.appendLine('Document symbol provider registered for outline support');
    
    // Register the arrow transformation feature
    registerArrowTransformations(context);
    
    // Register the emoticon feature
    registerEmoticonFeature(context);
    
    // Register the path completion provider
    registerPathCompletionProvider(context);
    
    outputChannel.appendLine('Arrow transformation feature registered');
    
    console.log('TxtDoc Format extension activated');
}

/**
 * Register the arrow transformation feature
 * @param {vscode.ExtensionContext} context 
 */
function registerArrowTransformations(context) {
    // Register a text document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            // Only process txtdoc files
            if (event.document.languageId !== 'txtdoc') return;
            
            // Check if any of the changes might contain arrow notations
            const containsArrowNotation = event.contentChanges.some(change => {
                return ARROW_TRANSFORMATIONS.some(transform => 
                    transform.pattern.test(change.text));
            });
            
            // If no potential arrow notations, skip processing
            if (!containsArrowNotation) return;
            
            // Process the document for arrow transformations
            await transformArrows(event.document);
        })
    );
    
    // Also register a document save listener to ensure arrows are transformed on save
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(async (event) => {
            if (event.document.languageId === 'txtdoc') {
                // Add a task to transform arrows before saving
                event.waitUntil(transformArrows(event.document));
            }
        })
    );
    
    // Process the active document on activation
    if (vscode.window.activeTextEditor && 
        vscode.window.activeTextEditor.document.languageId === 'txtdoc') {
        transformArrows(vscode.window.activeTextEditor.document);
    }
}

/**
 * Transform arrow notations in a document to Unicode arrows
 * @param {vscode.TextDocument} document - The document to transform
 * @returns {Promise<vscode.TextEdit[]>} - The text edits to apply
 */
async function transformArrows(document) {
    const text = document.getText();
    const edits = [];
    
    // Find and replace all arrow notations
    for (const transform of ARROW_TRANSFORMATIONS) {
        transform.pattern.lastIndex = 0; // Reset regex state
        let match;
        while ((match = transform.pattern.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            edits.push(vscode.TextEdit.replace(range, transform.replacement));
        }
    }
    
    // Apply the edits if there are any
    if (edits.length > 0) {
        const workspaceEdit = new vscode.WorkspaceEdit();
        edits.forEach(edit => workspaceEdit.replace(document.uri, edit.range, edit.newText));
        await vscode.workspace.applyEdit(workspaceEdit);
    }
    
    return edits;
}

/**
 * Register the emoticon feature
 * @param {vscode.ExtensionContext} context 
 */
function registerEmoticonFeature(context) {
    // Create decoration type for emoticon search
    emoticonSearchDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
        borderRadius: '3px'
    });
    
    // Register text document change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(async (event) => {
            // Only process txtdoc files
            if (event.document.languageId !== 'txtdoc') return;
            
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document !== event.document) return;
            
            // Check if any of the changes might contain emoticon search pattern
            const containsEmoticonSearch = event.contentChanges.some(change => {
                return EMOTICON_SEARCH_REGEX.test(change.text);
            });
            
            if (containsEmoticonSearch) {
                await handleEmoticonSearch(editor);
            }
        })
    );
    
    // Register selection change listener to cancel emoticon search when cursor moves
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(event => {
            if (activeEmoticonSearch && event.textEditor === vscode.window.activeTextEditor) {
                // Cancel emoticon search if cursor moved away from search position
                const position = event.textEditor.selection.active;
                if (!activeEmoticonSearch.range.contains(position)) {
                    cancelEmoticonSearch();
                }
            }
        })
    );
}

/**
 * Handle emoticon search in the editor
 * @param {vscode.TextEditor} editor 
 */
async function handleEmoticonSearch(editor) {
    const text = editor.document.getText();
    const matches = [];
    
    // Find all emoticon search patterns
    EMOTICON_SEARCH_REGEX.lastIndex = 0;
    let match;
    while ((match = EMOTICON_SEARCH_REGEX.exec(text)) !== null) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        const range = new vscode.Range(startPos, endPos);
        
        // Check if cursor is at or right after this match
        const cursorPos = editor.selection.active;
        if (range.contains(cursorPos) || 
            (cursorPos.line === endPos.line && cursorPos.character === endPos.character)) {
            
            const searchTerm = match[1].toLowerCase();
            matches.push({ range, searchTerm });
        }
    }
    
    // Process the match closest to cursor if any
    if (matches.length > 0) {
        const match = matches[matches.length - 1]; // Use the last match (closest to cursor)
        
        // Highlight the search term
        editor.setDecorations(emoticonSearchDecorationType, [match.range]);
        
        // Store active search
        activeEmoticonSearch = match;
        
        // Find matching emoticons
        const results = Array.from(EMOTICON_MAP.entries())
            .filter(([key]) => key.includes(match.searchTerm))
            .map(([key, value]) => ({ 
                label: `${value.emoticon} ${key}`,
                description: value.name,
                emoticon: value.emoticon
            }));
        
        if (results.length > 0) {
            // Show quick pick with matching emoticons
            emoticonQuickPick = vscode.window.createQuickPick();
            emoticonQuickPick.items = results;
            emoticonQuickPick.placeholder = 'Select an emoticon';
            
            emoticonQuickPick.onDidAccept(async () => {
                const selected = emoticonQuickPick.selectedItems[0];
                if (selected) {
                    await replaceEmoticonSearch(editor, match.range, selected.emoticon);
                }
                cancelEmoticonSearch();
            });
            
            emoticonQuickPick.onDidHide(() => cancelEmoticonSearch());
            emoticonQuickPick.show();
        }
    }
}

/**
 * Replace emoticon search with selected emoticon
 * @param {vscode.TextEditor} editor 
 * @param {vscode.Range} range 
 * @param {string} emoticon 
 */
async function replaceEmoticonSearch(editor, range, emoticon) {
    // Use WorkspaceEdit for more reliable editing
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.replace(editor.document.uri, range, emoticon);
    
    // Apply the edit and log the result
    const success = await vscode.workspace.applyEdit(workspaceEdit);
    outputChannel.appendLine(`Emoticon replacement ${success ? 'succeeded' : 'failed'}: ${emoticon}`);
    
    // Force a document save to ensure changes are applied
    return editor.document.save().then(() => {
        return success;
    });
}

/**
 * Cancel active emoticon search
 */
function cancelEmoticonSearch() {
    if (activeEmoticonSearch) {
        activeEmoticonSearch = null;
        
        // Clear decorations
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(emoticonSearchDecorationType, []);
        }
        
        // Hide quick pick
        if (emoticonQuickPick) {
            emoticonQuickPick.hide();
            emoticonQuickPick.dispose();
            emoticonQuickPick = null;
        }
    }
}

/**
 * Register the path completion provider
 * @param {vscode.ExtensionContext} context 
 */
function registerPathCompletionProvider(context) {
    // Register completion provider for file/folder paths
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        { language: 'txtdoc', scheme: 'file' },
        {
            async provideCompletionItems(document, position, token, context) {
                // Check if we're in a path context
                const linePrefix = document.lineAt(position).text.substring(0, position.character);
                
                // Check if we're typing a path
                const pathMatch = linePrefix.match(/(?:^|\s)([\.\/][\.\/\w-]*)$/);
                if (!pathMatch) {
                    return undefined;
                }
                
                const pathPrefix = pathMatch[1];
                return await getPathCompletionItems(document.uri, pathPrefix);
            }
        },
        ...PATH_COMPLETION_TRIGGERS
    );
    
    context.subscriptions.push(completionProvider);
    outputChannel.appendLine('Path completion provider registered');
}

/**
 * Get completion items for file/folder paths
 * @param {vscode.Uri} documentUri - The URI of the current document
 * @param {string} pathPrefix - The path prefix to complete
 * @returns {Promise<vscode.CompletionItem[]>} - The completion items
 */
async function getPathCompletionItems(documentUri, pathPrefix) {
    try {
        // Get the workspace folder containing the document
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
        if (!workspaceFolder) {
            return [];
        }
        
        // Determine the base directory for path completion
        let basePath = workspaceFolder.uri.fsPath;
        let relativePath = '';
        
        if (pathPrefix.startsWith('./') || pathPrefix.startsWith('../')) {
            // For relative paths, use the document's directory as base
            const documentDir = path.dirname(documentUri.fsPath);
            basePath = documentDir;
            relativePath = pathPrefix;
        } else if (pathPrefix.startsWith('/')) {
            // For absolute paths (within workspace), use workspace root
            relativePath = pathPrefix.substring(1); // Remove leading slash
        } else {
            // Default to current directory
            relativePath = pathPrefix;
        }
        
        // Resolve the target directory
        const targetDir = path.resolve(basePath, path.dirname(relativePath));
        const searchPattern = path.basename(relativePath);
        
        // Get files and folders in the target directory
        const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(targetDir));
        
        // Create completion items
        return files
            .filter(([name]) => name.startsWith(searchPattern))
            .map(([name, fileType]) => {
                const item = new vscode.CompletionItem(name, fileType === vscode.FileType.Directory ? 
                    vscode.CompletionItemKind.Folder : vscode.CompletionItemKind.File);
                item.detail = fileType === vscode.FileType.Directory ? 'Directory' : 'File';
                return item;
            });
    } catch (error) {
        outputChannel.appendLine(`Path completion error: ${error.message}`);
        return [];
    }
}

/**
 * Document Symbol Provider for TxtDoc files
 * Provides outline support for titles, sections, and code blocks
 */
class TxtDocDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        const symbols = [];
        const text = document.getText();
        let match;

        // Find sections
        SECTION_REGEX.lastIndex = 0;
        while ((match = SECTION_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            
            const symbol = new vscode.DocumentSymbol(
                match[1].trim(),
                'Section',
                vscode.SymbolKind.File,
                range,
                range
            );
            
            symbols.push(symbol);
        }
        
        // Find code blocks
        CODE_BLOCK_START_REGEX.lastIndex = 0;
        while ((match = CODE_BLOCK_START_REGEX.exec(text)) !== null) {
            if (token.isCancellationRequested) {
                return [];
            }
            
            // Find the end of the code block
            let blockEnd = match.index + match[0].length;
            let nextLine = text.indexOf('\n', blockEnd);
            
            while (nextLine !== -1 && text.substring(nextLine + 1, nextLine + 5).match(/^\s{4}/)) {
                blockEnd = nextLine;
                nextLine = text.indexOf('\n', blockEnd + 1);
            }
            
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(blockEnd);
            const range = new vscode.Range(startPos, endPos);
            
            // Extract the first line of the code block for the name
            const firstLine = match[1].trim();
            const blockName = firstLine.length > 0 ? firstLine : 'Code Block';
            
            const symbol = new vscode.DocumentSymbol(
                blockName,
                'Code Block',
                vscode.SymbolKind.Function,
                range,
                range
            );
            
            // Add code block to the appropriate parent if it exists
            const parentSymbol = this.findParentSymbol(symbols, startPos);
            if (parentSymbol && parentSymbol.kind === vscode.SymbolKind.File) {
                parentSymbol.children.push(symbol);
            } else {
                symbols.push(symbol);
            }
        }
        
        return symbols;
    }
    
    /**
     * Find the parent symbol for a given position
     * @param {vscode.DocumentSymbol[]} symbols - The list of symbols
     * @param {vscode.Position} position - The position to find a parent for
     * @returns {vscode.DocumentSymbol|null} - The parent symbol or null if not found
     */
    findParentSymbol(symbols, position) {
        for (const symbol of symbols) {
            if (symbol.range.contains(position) && 
                symbol.kind === vscode.SymbolKind.File) {
                return symbol;
            }
        }
        return null;
    }
}

function deactivate() {
    if (outputChannel) {
        outputChannel.appendLine('TxtDoc Format extension is now deactivated!');
        outputChannel.dispose();
    }
}

module.exports = {
  activate,
  deactivate,
};
