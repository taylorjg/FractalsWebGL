export class Region {
  constructor() {
    this._bottomLeft = { x: 0, y: 0 };
    this._topRight = { x: 0, y: 0 };
  }

  get top() {
    return this._topRight.y;
  }

  get bottom() {
    return this._bottomLeft.y;
  }

  get left() {
    return this._bottomLeft.x;
  }

  get right() {
    return this._topRight.x;
  }

  get topLeft() {
    return { x: this.left, y: this.top };
  }

  get topRight() {
    return { ...this._topRight };
  }

  get bottomLeft() {
    return { ...this._bottomLeft };
  }

  get bottomRight() {
    return { x: this.right, y: this.bottom };
  }

  get width() {
    return this._topRight.x - this._bottomLeft.x;
  }

  get height() {
    return this.topRight.y - this._bottomLeft.y;
  }

  get centreX() {
    return this.left + this.width / 2;
  }

  get centreY() {
    return this.bottom + this.height / 2;
  }

  set(bottomLeft, topRight) {
    this._bottomLeft.x = bottomLeft.x;
    this._bottomLeft.y = bottomLeft.y;
    this._topRight.x = topRight.x;
    this._topRight.y = topRight.y;
  }

  adjustAspectRatio(canvasWidth, canvasHeight) {
    if (canvasWidth >= canvasHeight) {
      const aspectRatio = canvasWidth / canvasHeight;
      const widthDelta = aspectRatio * this.height - this.width;
      const widthDeltaHalf = widthDelta / 2;
      this._bottomLeft.x -= widthDeltaHalf;
      this._topRight.x += widthDeltaHalf;
    }

    if (canvasWidth < canvasHeight) {
      const aspectRatio = canvasHeight / canvasWidth;
      const heightDelta = aspectRatio * this.width - this.height;
      const heightDeltaHalf = heightDelta / 2;
      this._bottomLeft.y -= heightDeltaHalf;
      this._topRight.y += heightDeltaHalf;
    }
  }

  mouseToRegion(canvas, mouseX, mouseY) {
    const widthRatio = this.width / canvas.width;
    const heightRatio = this.height / canvas.height;
    const offsetRatioX = mouseX * widthRatio;
    const offsetRatioY = mouseY * heightRatio;
    return {
      regionMouseX: this.left + offsetRatioX,
      regionMouseY: this.bottom + offsetRatioY,
    };
  }

  drag(canvas, mouseDeltaX, mouseDeltaY) {
    const widthRatio = this.width / canvas.width;
    const heightRatio = this.height / canvas.height;
    const regionDeltaX = mouseDeltaX * widthRatio;
    const regionDeltaY = mouseDeltaY * heightRatio;
    this._bottomLeft.x -= regionDeltaX;
    this._bottomLeft.y -= regionDeltaY;
    this._topRight.x -= regionDeltaX;
    this._topRight.y -= regionDeltaY;
  }

  recentre(regionMouseX, regionMouseY) {
    const translationX = regionMouseX - this.centreX;
    const translationY = regionMouseY - this.centreY;
    this._bottomLeft.x += translationX;
    this._bottomLeft.y += translationY;
    this._topRight.x += translationX;
    this._topRight.y += translationY;
  }

  panX(percent) {
    const widthDelta = (this.width / 100) * percent;
    this._bottomLeft.x -= widthDelta;
    this._topRight.x -= widthDelta;
  }

  panY(percent) {
    const heightDelta = (this.height / 100) * percent;
    this._bottomLeft.y -= heightDelta;
    this._topRight.y -= heightDelta;
  }

  zoom(percent) {
    const widthDelta = (this.width / 100) * percent;
    const widthDeltaHalf = widthDelta / 2;
    const heightDelta = (this.height / 100) * percent;
    const heightDeltaHalf = heightDelta / 2;
    this._bottomLeft.x += widthDeltaHalf;
    this._bottomLeft.y += heightDeltaHalf;
    this._topRight.x -= widthDeltaHalf;
    this._topRight.y -= heightDeltaHalf;
  }
}
