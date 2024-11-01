export default function jsonToBlueprint(text) {
    const compressed = zlibEncode(text);
    return '0' + compressed;
    function zlibEncode(text) {
        const encoder = new TextEncoder();
        const inputBytes = encoder.encode(text);
        const compressed = pako.deflate(inputBytes, { level: 9 });
        const compressedBase64 = btoa(String.fromCharCode(...compressed));
        // const compressedBase64 = btoa(String.fromCharCode.apply(null, compressed));
        return compressedBase64;
    }
}
//# sourceMappingURL=blueprintEncoder.js.map