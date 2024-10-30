declare var pako: any; // Если у вас есть типы для pako, замените `any` на соответствующий тип
export default function jsonToBlueprint(text: string): string {
    const compressed = zlibEncode(text);
    return '0' + compressed;

    function zlibEncode(text: string): string {
        const encoder = new TextEncoder();
        const inputBytes = encoder.encode(text);
        const compressed = pako.deflate(inputBytes, { level: 9 });
        const compressedBase64 = btoa(String.fromCharCode(...compressed));
        // const compressedBase64 = btoa(String.fromCharCode.apply(null, compressed));
        return compressedBase64;
    }
}