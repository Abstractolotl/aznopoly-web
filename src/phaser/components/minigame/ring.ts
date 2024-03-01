

export default class Ring extends Phaser.GameObjects.Container {
    
    constructor(scene: Phaser.Scene, x: number, y: number, radius: number, color: number) {
        super(scene, x, y);

        const segments = 4;

        let last = {x: 0, y: -radius};
        for (let i = 1; i < segments; i++) {
            const angle = (Math.PI / segments) * i - Math.PI * 0.5;
            const next = {
                x: Math.cos(angle) * radius, 
                y: Math.sin(angle) * radius,
            };
            const distance = Math.sqrt((next.x - last.x) ** 2 + (next.y - last.y) ** 2);

            const rect = new Phaser.GameObjects.Rectangle(scene, last.x, last.y, distance, 10, color);
            scene.physics.world.enable(rect);
            rect.setRotation((Math.PI / segments) * (i-1));
            const body = rect.body as Phaser.Physics.Arcade.Body;
            body.setAllowRotation(true);
            body.rotation = (Math.PI / segments) * (i-1);
            this.add(rect);

            last = next;
        }

    }
    
}