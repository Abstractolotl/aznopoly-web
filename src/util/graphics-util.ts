

export function DrawArrow(graphics: Phaser.GameObjects.Graphics, color: number, start: Phaser.Math.Vector2, end: Phaser.Math.Vector2, thickness: number = 5) {
    const arrow = graphics;
    arrow.clear();

    arrow.lineStyle(thickness, color);
    arrow.fillStyle(color);

    graphics.lineBetween(start.x, start.y, end.x, end.y);

    const arrowAngle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowAngleNormal = arrowAngle + Math.PI/2;
    const arrowHeadLength = thickness*2;
    const arrowHeadWidth = thickness*2;

    graphics.fillTriangle(
        end.x + Math.cos(arrowAngleNormal) * arrowHeadWidth,
        end.y + Math.sin(arrowAngleNormal) * arrowHeadWidth,
        end.x + Math.cos(arrowAngle) * arrowHeadLength,
        end.y + Math.sin(arrowAngle) * arrowHeadLength,
        end.x - Math.cos(arrowAngleNormal) * arrowHeadWidth,
        end.y - Math.sin(arrowAngleNormal) * arrowHeadWidth,
    );
}