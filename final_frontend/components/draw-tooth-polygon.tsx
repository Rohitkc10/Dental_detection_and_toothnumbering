type DrawToothPolygonArgs = {
  ctx: CanvasRenderingContext2D;
  polygon: number[][];
  imgW: number;
  imgH: number;
  displayWidth: number;
  displayHeight: number;
  offsetX: number;
  offsetY: number;
  highlight?: boolean;
};

export function drawToothPolygon({
  ctx,
  polygon,
  imgW,
  imgH,
  displayWidth,
  displayHeight,
  offsetX,
  offsetY,
  highlight = false
}: DrawToothPolygonArgs) {
  if (!polygon || polygon.length < 3) return;

  ctx.beginPath();

  polygon.forEach(([vx, vy], i) => {
    const x = offsetX + (vx / imgW) * displayWidth;
    const y = offsetY + (vy / imgH) * displayHeight;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.closePath();

  // 🔥 Visual style control
  ctx.fillStyle = highlight ? 'rgba(0, 255, 0, 0.35)' : 'rgba(0, 255, 0, 0.18)';

  ctx.strokeStyle = highlight ? 'rgba(0, 255, 0, 1)' : 'rgba(0, 255, 0, 0.8)';

  ctx.lineWidth = highlight ? 2.5 : 1.5;

  ctx.fill();
  ctx.stroke();
}
