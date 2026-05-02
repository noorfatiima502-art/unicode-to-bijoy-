const BanglaConverterFactory = (function() {

    const u2b_map = {
        'অ': 'A', 'আ': 'Av', 'ই': 'B', 'ঈ': 'C', 'উ': 'D', 'ঊ': 'E', 'ঋ': 'F', 'এ': 'G', 'ঐ': 'H', 'ও': 'I', 'ঔ': 'J',
        'ক': 'K', 'খ': 'L', 'গ': 'M', 'ঘ': 'N', 'ঙ': 'O', 
        'চ': 'P', 'ছ': 'Q', 'জ': 'R', 'ঝ': 'S', 'ঞ': 'T',
        'ট': 'U', 'ঠ': 'V', 'ড': 'W', 'ঢ': 'X', 'ণ': 'Y', 
        'ত': 'Z', 'থ': '_', 'দ': '`', 'ধ': 'a', 'ন': 'b',
        'প': 'c', 'ফ': 'd', 'ব': 'e', 'ভ': 'f', 'ম': 'g', 
        'য': 'h', 'র': 'i', 'ল': 'j', 'শ': 'k', 'ষ': 'l', 'স': 'm', 'হ': 'n',
        'ড়': 'o', 'ঢ়': 'p', 'য়': 'q', 'ৎ': 'r', 
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
        'া': 'v', 'ি': 'w', 'ী': 'x', 'ু': 'y', 'ূ': 'z', 'ৃ': '{', 'ে': '‡', 'ৈ': '‰', 'ো': '~', 'ৌ': 'ˆ',
        'ং': 's', 'ঃ': 't', 'ঁ': 'u', '্': '&', '্য': '¨', '্র': '«', 'র্': '©', '।': '|'
    };

    const b2u_map = {};
    for (let k in u2b_map) b2u_map[u2b_map[k]] = k;

    // Bijoy special conjunct string map -> unicode characters
    const bijoy_conjuncts = {
        "°": "ক্ক", "±": "ক্ট", "³": "ক্ত", "K¡": "ক্ব", "¯Œ": "স্ক্র", "µ": "ক্র", "K¬": "ক্ল", "¶": "ক্ষ", "ÿ": "ক্ষ", "·": "ক্স",
        "¸": "গু", "»": "গ্ধ", "Mœ": "গ্ন", "M¥": "গ্ম", "M­": "গ্ল", "¼": "ঙ্ক", "•¶": "ঙ্ক্ষ", "•L": "ঙ্খ", "½": "ঙ্গ", "•N": "ঙ্ঘ",
        "”P": "চ্চ", "”Q": "চ্ছ", "”Q¡": "চ্ছ্ব", "”T": "চ্ঞ", "¾¡": "জ্জ্ব", "¾": "জ্জ", "À": "জ্ঝ", "Á": "জ্ঞ", "R¡": "জ্ব",
        "Â": "ঞ্চ", "Ã": "ঞ্ছ", "Ä": "ঞ্জ", "Å": "ঞ্ঝ", "Æ": "ট্ট", "U¡": "ট্ব", "U¥": "ট্ম", "Ç": "ড্ড", "È": "ণ্ট", "É": "ণ্ঠ",
        "Ý": "ন্স", "Ê": "ণ্ড", "š‘": "ন্তু", "Y^": "ণ্ব", "Ë": "ত্ত", "Ë¡": "ত্ত্ব", "Ì": "ত্থ", "Z¥": "ত্ম", "š—¡": "ন্ত্ব",
        "Z¡": "ত্ব", "Î": "ত্র", "_¡": "থ্ব", "˜M": "দ্গ", "˜N": "দ্ঘ", "Ï": "দ্দ", "×": "দ্ধ", "˜¡": "দ্ব", "Ø": "দ্ব", "™¢": "দ্ভ",
        "Ù": "দ্ম", "`ª“": "দ্রু", "aŸ": "ধ্ব", "a¥": "ধ্ম", "›U": "ন্ট", "Ú": "ন্ঠ", "Û": "ন্ড", "šÍ": "ন্ত", "š—": "ন্ত", "š¿": "ন্ত্র",
        "š’": "ন্থ", "›`": "ন্দ", "›Ø": "ন্দ্ব", "Ü": "ন্ধ", "bœ": "ন্ন", "š^": "ন্ব", "b¥": "ন্ম", "Þ": "প্ট", "ß": "প্ত", "cœ": "প্ন",
        "à": "প্প", "cø": "প্ল", "c­": "প্ল", "á": "প্স", "d¬": "ফ্ল", "â": "ব্জ", "ã": "ব্দ", "ä": "ব্ধ", "eŸ": "ব্ব", "e­": "ব্ল",
        "å": "ভ্র", "gœ": "ম্ন", "¤ú": "ম্প", "ç": "ম্ফ", "¤^": "ম্ব", "¤¢": "ম্ভ", "¤£": "ম্ভ্র", "¤§": "ম্ম", "¤­": "ম্ল", "i“": "রু",
        "iæ": "রু", "iƒ": "রূ", "é": "ল্ক", "ê": "ল্গ", "ë": "ল্ট", "ì": "ল্ড", "í": "ল্প", "î": "ল্ফ", "j¦": "ল্ব", "j¥": "ল্ম",
        "jø": "ল্ল", "ï": "শু", "ð": "শ্চ", "kœ": "শ্ন", "kø": "শ্ল", "k¦": "শ্ব", "k¥": "শ্ম", "k­": "শ্ল", "®‹": "ষ্ক", "®Œ": "ষ্ক্র",
        "ó": "ষ্ট", "ô": "ষ্ঠ", "ò": "ষ্ণ", "®ú": "ষ্প", "õ": "ষ্ফ", "®§": "ষ্ম", "¯‹": "স্ক", "÷": "স্ট", "ö": "স্খ", "¯—": "স্ত",
        "¯Í": "স্ত", "¯‘": "স্তু", "¯¿": "স্ত্র", "¯’": "স্থ", "mœ": "স্ন", "¯ú": "স্প", "ù": "স্ফ", "¯^": "স্ব", "¯§": "স্ম",
        "¯­": "স্ল", "û": "হু", "nè": "হ্ণ", "ý": "হ্ন", "þ": "হ্ম", "n¬": "হ্ল", "ü": "হৃ"
    };

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function UnicodeToBijoy(text) {
        if (!text) return "";
        let line = text;

        // Map Repha to Bijoy format (before consonant in Unicode -> after in Bijoy)
        line = line.replace(/র্([\u0980-\u09FF])/g, "$1©");
        
        // Move e-kar, oi-kar BEFORE consonant
        // Move e-kar, oi-kar BEFORE consonant
        line = line.replace(/([\u0980-\u09FF])([েৈ])/g, "$2$1");

        // Split o-kar into e-kar + a-kar
        line = line.replace(/([\u0980-\u09FF])ো/g, "ে$1া");
        
        // Split ou-kar into e-kar + ou-kar-symbol
        line = line.replace(/([\u0980-\u09FF])ৌ/g, "ে$1ৗ");

        // Run reverse conjunct map first
        let keys = Object.keys(bijoy_conjuncts).sort((a, b) => bijoy_conjuncts[b].length - bijoy_conjuncts[a].length);
        for(let j of keys) {
            line = line.replace(new RegExp(escapeRegExp(bijoy_conjuncts[j]), 'g'), j);
        }

        // Run char map
        let charKeys = Object.keys(u2b_map).sort((a, b) => b.length - a.length);
        for(let j of charKeys) {
            line = line.replace(new RegExp(escapeRegExp(j), 'g'), u2b_map[j]);
        }

        return line;
    }

    function BijoyToUnicode(text) {
        if (!text) return "";
        let line = text;

        // Direct Maps from Bijoy Conjuncts
        let juktoKeys = Object.keys(bijoy_conjuncts).sort((a,b) => b.length - a.length);
        for (let k of juktoKeys) {
            line = line.replace(new RegExp(escapeRegExp(k), 'g'), bijoy_conjuncts[k]);
        }

        // Move e-kar, oi-kar AFTER consonant
        // Bijoy formatting puts ‡ (e-kar), ‰ (oi-kar) before consonant block.
        // It's usually followed by a consonant or conjunct.
        let rePreKar = /([‡‰])([K-Za-z0-9_`~]+)/g;
        line = line.replace(rePreKar, "$2$1");

        // Repha mapping - Bijoy © comes after consonant. Needs to be replaced to র্ BEFORE consonant.
        let reReph = /([K-Za-z0-9_`~]+)©/g;
        line = line.replace(reReph, "©$1");

        // Basic character maps
        let b2uKeys = Object.keys(b2u_map).sort((a,b) => b.length - a.length);
        for (let k of b2uKeys) {
            line = line.replace(new RegExp(escapeRegExp(k), 'g'), b2u_map[k]);
        }

        // Process composite modifiers
        // ে + া = ো
        line = line.replace(/ে([\u0980-\u09FF&]+)া/g, "$1ো");
        line = line.replace(/ে([\u0980-\u09FF&]+)ৗ/g, "$1ৌ");

        line = line.replace(/ে([\u0980-\u09FF\u200C-\u200D]+)া/g, "$1ো");
        line = line.replace(/ে([\u0980-\u09FF\u200C-\u200D]+)ৗ/g, "$1ৌ");

        // Post process cleanup
        line = line.replace(/অা/g, "আ");

        return line;
    }

    return {
        toBijoy: UnicodeToBijoy,
        toUnicode: BijoyToUnicode
    };

})();
