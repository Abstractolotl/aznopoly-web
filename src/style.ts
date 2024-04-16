const FONT_DEFAULT = "Montserrat";

const COLORS_BLACK = 0x00101A;
const COLORS_WHITE = 0xFFFFFF;

// Semantic values
export const COLOR_FRAME_DECORATION = COLORS_WHITE;
export const COLOR_FRAME_BACKGROUND = COLORS_BLACK;
export const COLOR_FRAME_BACKGROUND_TRANSPARENCY = 0.2;

export const COLOR_BUTTON_PRIMARY = COLORS_WHITE;

export const FRAME_PADDING = 14;
export const FRAME_BORDER_RADIUS = 5;
export const FRAME_BORDER_WIDTH = 0;

const toHex = (color: number) => {
    return "#" + color.toString(16);
}

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

// Used for title in top bar of frames
export const FONT_STYLE_HEADLINE_SIZE = 16;
export const FONT_STYLE_HEADLINE: TextStyle = {
    fontFamily: FONT_DEFAULT,
    fontSize: FONT_STYLE_HEADLINE_SIZE,
    color: toHex(COLORS_WHITE),
    align: 'center',
    
}

export const FONT_STYLE_EYECATCHER_SIZE = 24;
export const FONT_STYLE_EYECATCHER: TextStyle = {
    fontFamily: FONT_DEFAULT,
    fontSize: FONT_STYLE_EYECATCHER_SIZE,
    color: toHex(COLORS_WHITE),
    align: 'center',
}


export const FONT_STYLE_BUTTON_SIZE = 18;
export const FONT_STYLE_BUTTON: TextStyle = { 
    fontFamily: FONT_DEFAULT,
    fontSize: FONT_STYLE_BUTTON_SIZE,
    color: toHex(COLORS_WHITE),
    align: 'center' 
}
export const FONT_STYLE_BUTTON_HOVER: TextStyle = { 
    fontFamily: FONT_DEFAULT,
    fontSize: FONT_STYLE_BUTTON_SIZE,
    color: toHex(COLORS_BLACK),
    align: 'center' 
}


export const FONT_STYLE_BODY_SIZE = 20;
export const FONT_STYLE_BODY: TextStyle = {
    fontFamily: FONT_DEFAULT,
    fontSize: FONT_STYLE_BODY_SIZE,
    color: toHex(COLORS_WHITE),
    // color: '#73c8e4',
    align: 'center'
}










// TO REMOVE / REWORK
export const FONT_STYLE_BUTTON_DOWN: Phaser.Types.GameObjects.Text.TextStyle = { font: '600 32px Comfortaa', color: '#ffffff', align: 'center' }

export const COLOR_PRIMARY = 0x4690A9;

export const COLOR_ACCENT = 0x4690A9;
export const COLOR_BACKGROUND = 0x73c8e4;
export const COLOR_TEXT = COLOR_PRIMARY;
export const COLOR_TEXT_INVERTED = 0x4690A9;
export const COLOR_BACKGROUND_LIGHT = 0xe6f9ff;


export const COLOR_PRIMARY_2 = 0x73c8e4;
export const COLOR_CONTRAST = 0x73c8e4;

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

export const FONT_STYLE_DIGITS: TextStyle = {
    fontFamily: '"Kode Mono"',
    fontSize: "32px",
    color: toHex(COLOR_TEXT),
    align: 'center'
}

export const PLAYER_COLORS = [
    0xFF6666, // Red
    0x66FF66, // Green
    0x6666FF, // Blue
    0xFFFF66, // Yellow
    0xFF66FF, // Purple
    0x66FFFF, // Cyan
    0xFFB366, // Orange
    0x66FFB3, // Light Green
    0xB366FF, // Light Purple
    0xB3FF66, // Lime
]