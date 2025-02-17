type RGB = { r: number; g: number; b: number };

export function hexToRGB(hex: string): RGB {
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    if (hex.length !== 6) {
        throw new Error("Formato inválido de cor hexadecimal.");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return { r, g, b };
}

export function getLuminance({ r, g, b }: RGB): number {
    const [R, G, B] = [r, g, b].map((channel) => {
        const scaled = channel / 255;
        return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrast(hex: string): string {
    const inputColor = hexToRGB(hex);

    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    const contrastWithWhite = calculateContrast(inputColor, white);
    const contrastWithBlack = calculateContrast(inputColor, black);

    return contrastWithWhite > contrastWithBlack ? '#FFFFFF' : '#000000';
}

export function calculateContrast(color1: RGB, color2: RGB): number {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);

    return (brightest + 0.05) / (darkest + 0.05);
}

