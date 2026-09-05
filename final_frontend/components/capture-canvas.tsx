export function getCanvasPoint(canvas: HTMLCanvasElement, evt: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function captureCanvasRect(
  sourceCanvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number }
): string {
  const { x, y, width, height } = rect;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;

  const ctx = tempCanvas.getContext('2d')!;
  ctx.drawImage(
    sourceCanvas,
    x,
    y,
    width,
    height, // source rect
    0,
    0,
    width,
    height // destination rect
  );

  return tempCanvas.toDataURL('image/png');
}
