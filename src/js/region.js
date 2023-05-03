export class Region {
  _bottomLeft = { x: 0, y: 0 };
  _topRight = { x: 0, y: 0 };
  _savedBottomLeft = undefined;
  _savedTopRight = undefined;

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

  save() {
    this._savedBottomLeft = { ...this._bottomLeft };
    this._savedTopRight = { ...this._topRight };
  }

  restore() {
    if (this._savedBottomLeft && this._savedTopRight) {
      this.set(this._savedBottomLeft, this._savedTopRight);
      this._savedBottomLeft = undefined;
      this._savedTopRight = undefined;
    }
  }

  set(bottomLeft, topRight) {
    this._bottomLeft.x = bottomLeft.x;
    this._bottomLeft.y = bottomLeft.y;
    this._topRight.x = topRight.x;
    this._topRight.y = topRight.y;
  }

  adjustAspectRatio(canvasWidth, canvasHeight) {
    if (canvasWidth >= canvasHeight) {
      const widthDelta =
        (canvasWidth / canvasHeight) * this.height - this.width;
      const widthDeltaHalf = widthDelta / 2;
      this._bottomLeft.x -= widthDeltaHalf;
      this._topRight.x += widthDeltaHalf;
    }

    if (canvasWidth < canvasHeight) {
      const heightDelta =
        (canvasHeight / canvasWidth) * this.width - this.height;
      const heightDeltaHalf = heightDelta / 2;
      this._bottomLeft.y -= heightDeltaHalf;
      this._topRight.y += heightDeltaHalf;
    }
  }

  adjustToMakeLargestSquare() {
    const width = this.width;
    const height = this.height;
    const minDimension = Math.min(width, height);
    const maxDimension = Math.max(width, height);
    const delta = (maxDimension - minDimension) / 2;
    if (width >= height) {
      this._bottomLeft.x += delta;
      this._topRight.x -= delta;
    } else {
      this._bottomLeft.y += delta;
      this._topRight.y -= delta;
    }
  }

  mouseToRegion(canvas, mouseX, mouseY) {
    const offsetRatioX = (mouseX * this.width) / canvas.width;
    const offsetRatioY = (mouseY * this.height) / canvas.height;
    return {
      regionMouseX: this.left + offsetRatioX,
      regionMouseY: this.bottom + offsetRatioY,
    };
  }

  move(canvas, mouseDeltaX, mouseDeltaY) {
    const regionDeltaX = (mouseDeltaX * this.width) / canvas.width;
    const regionDeltaY = (mouseDeltaY * this.height) / canvas.height;
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
