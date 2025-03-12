// Regular expressions for matching different elements
export const SECTION_REGEX = /^([A-Z][^\n:]*)$/gm; // Exclude lines with colons (metadata)
export const NUMBERED_SECTION_REGEX = /^([0-9]+(?:\.[0-9]+)*)\. ([^\n]*)$/gm;
export const ALTERNATIVE_SECTION_REGEX = /^: ([^\n]*)$/gm;
export const FOOTNOTE_REGEX = /^\[(\d+)\] (.+)$/gm;
export const METADATA_REGEX = /^([A-Za-z0-9 ]+)\s{2,}(.+)$/gm; // Metadata pattern
export const CODE_BLOCK_START_REGEX = /^(\s{4}.*)/gm;
export const FOOTNOTE_REFERENCE_REGEX = /\[(\d+)\]/g;
export const DOCUMENT_REFERENCE_REGEX = /see:\s+([^#\s]+)(?:#([a-zA-Z0-9-]+))?/g;
export const QUOTE_REGEX = /^>\s+(.+)$/gm;
export const NESTED_QUOTE_REGEX = /^>>\s+(.+)$/gm;

// Regular expression to match insertion search pattern
export const INSERTION_SEARCH_REGEX = /:([a-zA-Z0-9_]+)/g;

// Path completion trigger characters
export const PATH_COMPLETION_TRIGGERS: string[] = ['/'];

// Interface for emoticon items
export interface EmoticonItem {
    name: string;
    emoticon: string;
}

// Emoticons data - this will be populated from insertions.yaml
export const EMOTICONS: EmoticonItem[] = [];

// Regular expression to match emoticon search pattern
// Format: :emoji_name
export const EMOTICON_SEARCH_REGEX = /:([a-zA-Z0-9_]+)/g;

// Interface for arrow transformation
export interface ArrowTransformation {
    pattern: RegExp;
    replacement: string;
    [key: number]: string; // For array-like access (pattern at index 0, replacement at index 1)
}

// Arrow transformations - will be populated from transforms.yaml
// Each transformation converts an arrow notation (e.g., ->) to a Unicode arrow (e.g., →)
export const ARROW_TRANSFORMATIONS: ArrowTransformation[] = [];
