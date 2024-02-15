export const COLOR_PRIMARY = 0x4690A9;

export const COLOR_ACCENT = 0x4690A9;
export const COLOR_BACKGROUND = 0x73c8e4;
export const COLOR_TEXT = COLOR_PRIMARY;
export const COLOR_TEXT_INVERTED = 0x4690A9;
export const COLOR_BACKGROUND_LIGHT = 0xe6f9ff;

export const FRAME_PADDING = 15;
export const FRAME_BORDER_RADIUS = 5;
export const FRAME_BORDER_WIDTH = 5;

export const COLOR_PRIMARY_2 = 0x73c8e4;
export const COLOR_CONTRAST = 0x73c8e4;

export const PLAYER_COLORS = [
    0xFF0000,
    0x00FF00,
    0x0000FF,
    0xFFFF00,
]

const toHex = (color: number) => {
    return "#" + color.toString(16);
}

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;
export const FONT_STYLE_HEADLINE: TextStyle = {
    fontFamily: 'Comfortaa',
    fontSize: 64,
    color: toHex(COLOR_PRIMARY),
    align: 'center'
}
export const FONT_STYLE_BODY: TextStyle = {
    fontFamily: 'Comfortaa',
    fontSize: 32,
    color: toHex(COLOR_TEXT),
    // color: '#73c8e4',
    align: 'center'
}
export const FONT_STYLE_BUTTON: TextStyle = {
    fontFamily: 'Comfortaa',
    color: '#ffffff',
    // color: '#73c8e4',
    fontSize: 32,
    align: 'center'
}
export const FONT_STYLE_BUTTON_HOVER: TextStyle = {
    fontFamily: 'Comfortaa',
    fontSize: 32,
    color: '#ffffff',
    align: 'center'
}

export const FONT_STYLE_COPYRIGHT_FLAVOUR_TEXT: TextStyle = {
    fontFamily: 'Comfortaa',
    color: "black",
    fontSize: '20px',
}

export const FONT_STYLE_TITLE_TEXT: TextStyle = {
    font: '600 150px Comfortaa',
    color: '#000000',
    fontSize: '200px',
    stroke: '#ffffff',
    strokeThickness: 10,
}