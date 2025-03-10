// Regular expressions for matching different elements
const SECTION_REGEX = /^([A-Z][^\n:]*)$/gm; // Exclude lines with colons (metadata)
const NUMBERED_SECTION_REGEX = /^([0-9]+(?:\.[0-9]+)*)\. ([^\n]*)$/gm;
const ALTERNATIVE_SECTION_REGEX = /^: ([^\n]*)$/gm;
const FOOTNOTE_REGEX = /^\[(\d+)\] (.+)$/gm;
const METADATA_REGEX = /^([A-Za-z0-9 ]+)\s{2,}(.+)$/gm; // Metadata pattern
const CODE_BLOCK_START_REGEX = /^(\s{4}.*)/gm;
const FOOTNOTE_REFERENCE_REGEX = /\[(\d+)\]/g;
const DOCUMENT_REFERENCE_REGEX = /see:\s+([^#\s]+)(?:#([a-zA-Z0-9-]+))?/g;
const QUOTE_REGEX = /^>\s+(.+)$/gm;
const NESTED_QUOTE_REGEX = /^>>\s+(.+)$/gm;

// Regular expression to match insertion search pattern
const INSERTION_SEARCH_REGEX = /:([a-zA-Z0-9_]+)/g;

// Path completion trigger characters
const PATH_COMPLETION_TRIGGERS = ['/'];

// Export all constants
module.exports = {
    SECTION_REGEX,
    NUMBERED_SECTION_REGEX,
    ALTERNATIVE_SECTION_REGEX,
    FOOTNOTE_REGEX,
    METADATA_REGEX,
    CODE_BLOCK_START_REGEX,
    FOOTNOTE_REFERENCE_REGEX,
    DOCUMENT_REFERENCE_REGEX,
    QUOTE_REGEX,
    NESTED_QUOTE_REGEX,
    INSERTION_SEARCH_REGEX,
    PATH_COMPLETION_TRIGGERS
};