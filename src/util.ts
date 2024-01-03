import { Scene } from "phaser";
import { FONT_STYLE_BUTTON, FONT_STYLE_BUTTON_HOVER } from "./style";

export function easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3;
    
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

/* DEPRECATED */
export function makeButton(scene: Scene, text: string, x: number, y: number, onClick: () => void) : Phaser.GameObjects.Text {
    const btn = scene.add.text(x, y, text, FONT_STYLE_BUTTON);
    btn.setInteractive();
    btn.on('pointerover', () => {
        btn.setX(110);
        btn.setStyle(FONT_STYLE_BUTTON_HOVER);
    });
    btn.on('pointerout', () => {
        btn.setX(100);
        btn.setStyle(FONT_STYLE_BUTTON);
    });
    btn.on('pointerdown', onClick);
    return btn;
}


export function getColorFromUUID(uuid: string) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = Math.floor(Math.abs((Math.sin(hash) * 16777215) % 1) * 16777215);
    return color;
}