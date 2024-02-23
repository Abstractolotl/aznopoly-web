import convert from 'color-convert';

export function easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

export function getColorFromUUID(uuid: string) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);

    return Number("0x" + convert.hsl.hex([color % 360, 100, 50]));
}