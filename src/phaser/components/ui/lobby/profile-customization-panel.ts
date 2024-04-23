import { FONT_STYLE_BODY, PLAYER_COLORS } from "@/style";
import AzNopolyAvatar, { Avatars, rotateAvatar } from "../avatar";
import AzNopolyPanel from "../panel";
import AzNopolyInput from "../input-field";
import { PlayerProfile } from "../player-info";


const WIDTH = 600;
const HEIGHT = 360;
export default class ProfileCustomizationPanel extends AzNopolyPanel {
    public static WIDTH = WIDTH;
    public static HEIGHT = HEIGHT;

    static preload(scene: Phaser.Scene) {
        AzNopolyAvatar.preload(scene);
        AzNopolyInput.preload(scene);
    }

    private avatar: AzNopolyAvatar;
    private profile: PlayerProfile;

    private callback?: (profile: PlayerProfile) => void;

    private inputName: AzNopolyInput;
    private arrowLeft: AzNopolyAvatar;
    private arrowRight: AzNopolyAvatar;
    private colorSelectRect: Phaser.GameObjects.Rectangle;
    private colorRects: Phaser.GameObjects.Rectangle[] = [];
    
    private availableColorIndexes = PLAYER_COLORS.map((_, i) => i);
    private availableAvatars = Object.values(Avatars);

    constructor(scene: Phaser.Scene, x: number, y: number, profile: PlayerProfile) {
        super(scene, x, y, WIDTH, HEIGHT, "PROFILE CUSTOMIZATION");
        this.setPosition(x - WIDTH * 0.5, y - HEIGHT * 0.5);
        this.profile = profile;

        const bounds = this.contentRect;

        const color = this.profile.colorIndex;
        this.avatar = new AzNopolyAvatar(scene, bounds.x + bounds.width * 0.5, bounds.y + 65, 100, localStorage.getItem("playerAvatar") as Avatars || Avatars.AXOLOTL, color);
        const moving = new AzNopolyAvatar(scene, this.avatar.x, this.avatar.y, 100, Avatars.AXOLOTL, color);
        const moving2 = new AzNopolyAvatar(scene, this.avatar.y, this.avatar.y, 100, Avatars.AXOLOTL, color);
        moving.setVisible(false);
        moving2.setVisible(false);

        let moveInProcess = false;

        this.arrowLeft = new AzNopolyAvatar(scene, this.avatar.x - 75, this.avatar.y, 75, rotateAvatar(this.avatar.getAvatar(), 1), color);
        //arrowLeft.setOrigin(1, 0.5);
        this.arrowLeft.setAlpha(0.5);
        this.arrowLeft.setInteractive();
        this.arrowLeft.on('pointerdown', () => {
            if (moveInProcess) return;
            moveInProcess = true;

            this.avatar.setVisible(false);
            this.tweenAvatars(this.arrowLeft, this.avatar, moving, () => {
                this.avatar.setAvatar(rotateAvatar(this.avatar.getAvatar(), 1));
                this.arrowLeft.setAvatar(rotateAvatar(this.avatar.getAvatar(), 1));
                this.arrowRight.setAvatar(rotateAvatar(this.avatar.getAvatar(), -1));
                moveInProcess = false;
                this.avatar.setVisible(true);
                this.onAvatarChange(this.avatar.getAvatar());
            });
            this.tweenAvatars(this.avatar, this.arrowRight, moving2);
            this.arrowLeft.setAvatar(rotateAvatar(this.avatar.getAvatar(), 2));
        });

        this.arrowRight = new AzNopolyAvatar(scene, this.avatar.x + 75, this.avatar.y, 75, rotateAvatar(this.avatar.getAvatar(), -1), color);
        this.arrowRight.setAlpha(0.5);
        this.arrowRight.setInteractive();
        this.arrowRight.on('pointerdown', () => {
            if (moveInProcess) return;
            moveInProcess = true;

            this.avatar.setVisible(false);
            this.tweenAvatars(this.arrowRight, this.avatar, moving, () => {
                this.avatar.setAvatar(rotateAvatar(this.avatar.getAvatar(), -1));
                this.arrowLeft.setAvatar(rotateAvatar(this.avatar.getAvatar(), 1));
                this.arrowRight.setAvatar(rotateAvatar(this.avatar.getAvatar(), -1));

                this.arrowLeft.setLocked(!this.availableAvatars.includes(this.arrowLeft.getAvatar()));
                this.arrowRight.setLocked(!this.availableAvatars.includes(this.arrowRight.getAvatar()));
                this.avatar.setLocked(!this.availableAvatars.includes(this.avatar.getAvatar()));

                moveInProcess = false;
                this.avatar.setVisible(true);
                this.onAvatarChange(this.avatar.getAvatar());
            });
            this.tweenAvatars(this.avatar, this.arrowLeft, moving2);
            this.arrowRight.setAvatar(rotateAvatar(this.avatar.getAvatar(), 2));

            this.arrowLeft.setLocked(!this.availableAvatars.includes(this.arrowLeft.getAvatar()));
            this.arrowRight.setLocked(!this.availableAvatars.includes(this.arrowRight.getAvatar()));
            this.avatar.setLocked(!this.availableAvatars.includes(this.avatar.getAvatar()));
        });

        const spacing = 50;
        const labelName = new Phaser.GameObjects.Text(scene, bounds.x + bounds.width * 0.5 - 25, bounds.y + 170 + spacing * 0, "NAME", FONT_STYLE_BODY);
        labelName.setOrigin(1, 0.5);

        this.inputName = new AzNopolyInput(scene, bounds.x + bounds.width * 0.5, labelName.y, 200, 40, "text");
        this.inputName.setPosition(this.inputName.x, this.inputName.y - this.inputName.height * 0.5);
        this.inputName.setValue(this.profile.name);
        this.inputName.setChangeListener((value) => {
            this.onNameChange(value);
        });

        const labelColor = new Phaser.GameObjects.Text(scene, bounds.x + bounds.width * 0.5 - 25, bounds.y + 170 + spacing * 1, "COLOR", FONT_STYLE_BODY);
        labelColor.setOrigin(1, 0.5);

        this.colorSelectRect = new Phaser.GameObjects.Rectangle(scene, labelColor.x + 25, labelColor.y, 31, 31, 0xffffff);
        this.add(this.colorSelectRect);
        for (let i = 0; i < PLAYER_COLORS.length; i++) {
            const { x: posX, y: posY } = this.getColorPosition(i);
            if (i == this.profile.colorIndex) {
                this.colorSelectRect.setPosition(posX, posY);
            }
            const rect = this.createColor(posX, posY, PLAYER_COLORS[i], () => {
                this.colorSelectRect.setPosition(posX, posY);
                [moving, moving2, this.avatar, this.arrowLeft, this.arrowRight].forEach((e) => {
                    e.setBorderColor(i);
                });
                this.onColorChange(i);
            });
            this.colorRects.push(rect);
        }

        /*
        const labelAvatar = new Phaser.GameObjects.Text(scene, bounds.x + bounds.width * 0.5 - 25, bounds.y + 170 + spacing * 2, "AVATAR", FONT_STYLE_BODY);
        labelAvatar.setOrigin(1, 0.5);
        this.add(labelAvatar);
        */

        this.add(this.arrowLeft);
        this.add(this.arrowRight);
        this.add(this.avatar);
        this.add(moving2);
        this.add(moving);

        this.add(labelName);
        this.add(this.inputName);

        this.add(labelColor);

        this.add(this.graphics);
    }

    private getColorPosition(index: number) {
        const x = this.contentRect.x + this.contentRect.width * 0.5 + (index % 5) * 50;
        const y = this.contentRect.y + 220 + Math.floor(index / 5) * 50;
        return { x, y };
    }

    private tweenAvatars(source: AzNopolyAvatar, target: AzNopolyAvatar, moving: AzNopolyAvatar, onComplete?: () => void) {
        moving.setPosition(source.x, source.y);
        moving.setAvatar(source.getAvatar());
        moving.setAvatarSize(source.getAvatarSize());
        moving.setVisible(true);
        moving.setAlpha(source.alpha);
        moving.setBorderColor(source.getBorderColor());
        moving.setLocked(!this.availableAvatars.includes(moving.getAvatar()));

        return this.scene.tweens.addCounter({
            ease: 'Sine.easeInOut',
            duration: 150,
            onUpdate: (tween) => {
                const startX = source.x;
                const endX = target.x;

                const x = startX + (endX - startX) * tween.getValue();
                moving.setPosition(x, source.y);

                const startSize = source.getAvatarSize();
                const endSize = target.getAvatarSize();

                const size = startSize + (endSize - startSize) * tween.getValue();
                moving.setAvatarSize(size);

                const startAlpha = source.alpha;
                const endAlpha = target.alpha;

                const alpha = startAlpha + (endAlpha - startAlpha) * tween.getValue();
                moving.setAlpha(alpha);
            },
            onComplete: () => {
                moving.setVisible(false);
                onComplete?.();
            }
        })
    }

    public setProfileChangeCallback(callback: (profile: PlayerProfile) => void) {
        this.callback = callback;
    }

    private onNameChange(name: string) {
        localStorage.setItem("playerName", name);
        this.profile.name = name;
        this.callback?.(this.profile);
    }

    private onAvatarChange(avatar: Avatars) {
        localStorage.setItem("playerAvatar", avatar);
        this.profile.avatar = avatar;

        if (this.callback && this.availableAvatars.includes(avatar)) {
            this.callback(this.profile);
        } else {
            console.log("Avatar not available");
        }
    }

    private onColorChange(color: number) {
        localStorage.setItem("playerColor", color.toString());
        this.profile.colorIndex = color;

        if (this.callback && this.availableColorIndexes.includes(color)) {
            this.callback(this.profile);
        } else {
            console.log("Color not available", this.availableColorIndexes, color);
        }
    }

    public updateProfile(profile: PlayerProfile) {
        this.profile = profile;

        this.inputName.setValue(profile.name);
        this.avatar.setAvatar(profile.avatar);

        this.avatar.setBorderColor(profile.colorIndex);
        this.arrowLeft.setBorderColor(profile.colorIndex);
        this.arrowRight.setBorderColor(profile.colorIndex);

        this.arrowLeft.setAvatar(rotateAvatar(profile.avatar, 1));
        this.arrowRight.setAvatar(rotateAvatar(profile.avatar, -1));

        this.colorSelectRect.setPosition(this.getColorPosition(profile.colorIndex).x, this.getColorPosition(profile.colorIndex).y);
    }

    public updateAvailable(colors: number[], avatars: Avatars[]) {
        this.availableColorIndexes = colors;
        this.availableAvatars = avatars;

        this.colorRects.forEach((rect, i) => {
            rect.setVisible(colors.includes(i));
        });

        this.arrowLeft.setLocked(!this.availableAvatars.includes(this.arrowLeft.getAvatar()));
        this.arrowRight.setLocked(!this.availableAvatars.includes(this.arrowRight.getAvatar()));
        this.avatar.setLocked(!this.availableAvatars.includes(this.avatar.getAvatar()));
    }

    private createColor(x: number, y: number, color: number, onClick: () => void) {
        const rect = new Phaser.GameObjects.Rectangle(this.scene, x, y, 25, 25, color);
        rect.setInteractive();
        rect.on('pointerdown', onClick);
        this.add(rect);
        return rect;
    }

}