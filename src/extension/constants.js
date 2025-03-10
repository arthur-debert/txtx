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

// Regular expression to match emoticon search pattern
const EMOTICON_SEARCH_REGEX = /:([a-zA-Z0-9_]+)/g;

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
    ARROW_TRANSFORMATIONS,
    EMOTICONS,
    EMOTICON_SEARCH_REGEX,
    PATH_COMPLETION_TRIGGERS
};