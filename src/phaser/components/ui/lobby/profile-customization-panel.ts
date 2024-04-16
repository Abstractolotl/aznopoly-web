import { FONT_STYLE_BODY, PLAYER_COLORS } from "@/style";
import AzNopolyAvatar, { Avatars, rotateAvatar } from "../avatar";
import AzNopolyPanel from "../panel";
import AzNopolyInput from "../input-field";
import { PlayerProfile } from "../player-info";


export default class ProfileCustomizationPanel extends AzNopolyPanel {

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

    constructor(scene: Phaser.Scene, x: number, y: number, profile: PlayerProfile) {
        super(scene, x, y, 600, 360, "PROFILE CUSTOMIZATION");
        this.setPosition(x - 300, y - 180);
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
                moveInProcess = false;
                this.avatar.setVisible(true);
                this.onAvatarChange(this.avatar.getAvatar());
            });
            this.tweenAvatars(this.avatar, this.arrowLeft, moving2);
            this.arrowRight.setAvatar(rotateAvatar(this.avatar.getAvatar(), 2));
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

        const selectedRect = new Phaser.GameObjects.Rectangle(scene, labelColor.x + 25, labelColor.y, 31, 31, 0xffffff);
        this.add(selectedRect);
        for (let i = 0; i < PLAYER_COLORS.length; i++) {
            const posX = labelColor.x + 25 + (i % 5) * 50;
            const posY = labelColor.y + Math.floor(i / 5) * 50;
            if (i == this.profile.colorIndex) {
                selectedRect.setPosition(posX, posY);
            }
            this.createColor(posX, posY, PLAYER_COLORS[i], () => {
                selectedRect.setPosition(posX, posY);
                [moving, moving2, this.avatar, this.arrowLeft, this.arrowRight].forEach((e) => {
                    e.setBorderColor(i);
                    this.onColorChange(i);
                });
            });
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

    private tweenAvatars(source: AzNopolyAvatar, target: AzNopolyAvatar, moving: AzNopolyAvatar, onComplete?: () => void) {
        moving.setPosition(source.x, source.y);
        moving.setAvatar(source.getAvatar());
        moving.setAvatarSize(source.getAvatarSize());
        moving.setVisible(true);
        moving.setAlpha(source.alpha);
        moving.setBorderColor(source.getBorderColor());

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
        this.callback?.(this.profile);
    }

    private onColorChange(color: number) {
        localStorage.setItem("playerColor", color.toString());
        this.profile.colorIndex = color;
        this.callback?.(this.profile);
    }

    public updateProfile(profile: PlayerProfile) {
        this.profile = profile;

        this.avatar.setAvatar(profile.avatar);

        this.avatar.setBorderColor(profile.colorIndex);
        this.arrowLeft.setBorderColor(profile.colorIndex);
        this.arrowRight.setBorderColor(profile.colorIndex);

        this.arrowLeft.setAvatar(rotateAvatar(profile.avatar, 1));
        this.arrowRight.setAvatar(rotateAvatar(profile.avatar, -1));
    }

    private createColor(x: number, y: number, color: number, onClick: () => void) {
        const rect = new Phaser.GameObjects.Rectangle(this.scene, x, y, 25, 25, color);
        rect.setInteractive();
        rect.on('pointerdown', onClick);
        this.add(rect);
    }

}