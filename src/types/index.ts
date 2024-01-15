export interface Player {
    uuid: string;
    name: string;
}

export type Audio = Phaser.Sound.WebAudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound