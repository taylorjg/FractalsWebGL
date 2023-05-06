import * as C from "./constants";

const THUMBNAIL_SIZE = 64;

export const configureUI = ({
  isWebGL2,
  renderThumbnail,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  switchToBookmark,
  fractalSets,
  colourMaps,
  onModalOpen,
  onModalClose,
}) => {
  const drawThumbnail = (pixels, canvas, size) => {
    canvas.width = size;
    canvas.height = size;
    const canvasCtx2d = canvas.getContext("2d");

    const imageData = new ImageData(pixels, size, size);
    canvasCtx2d.putImageData(imageData, 0, 0);

    // Seems we need to flip the image vertically.
    // https://stackoverflow.com/a/41970080
    canvasCtx2d.scale(1, -1);
    canvasCtx2d.translate(0, -size);
    canvasCtx2d.drawImage(canvas, 0, 0);
  };

  const presentBookmarkModal = (bookmark) => {
    console.log("[presentBookmarkModal]", "bookmark:", bookmark);
    const bookmarkModal = $("#bookmarkModal")
      .on("show.bs.modal", onModalOpen)
      .on("hide.bs.modal", onModalClose);
    const hasId = Number.isInteger(bookmark.id);
    const title = hasId ? "Edit Bookmark" : "Create Bookmark";
    $(".modal-title", bookmarkModal).text(title);
    $('input[type="submit"]', bookmarkModal)
      .off("click")
      .on("click", (e) => {
        e.preventDefault();
        bookmark.name = $("#name", bookmarkModal).val();
        hasId ? updateBookmark(bookmark) : addBookmark(bookmark);
        bookmarkModal.modal("hide");
      });
    const thumbnailCanvas = $("#thumbnail-canvas", bookmarkModal).get(0);
    const pixels = renderThumbnail(THUMBNAIL_SIZE, bookmark);
    drawThumbnail(pixels, thumbnailCanvas, THUMBNAIL_SIZE);
    $("#name", bookmarkModal).val(bookmark.name).focus();
    $(".fractal-set", bookmarkModal).text(fractalSets.get(bookmark.fractalSetId).name);
    const colourMapSelect = $("#colour-map-select", bookmarkModal).empty();
    for (const [colourMapId, colourMap] of colourMaps) {
      const selected = colourMapId === bookmark.colourMapId ? "selected" : "";
      colourMapSelect.append(
        `<option value="${colourMapId}" ${selected}>${colourMap.name}</option>`
      );
    }
    colourMapSelect.on("change", (e) => {
      bookmark.colourMapId = Number(e.target.value);
      const pixels = renderThumbnail(THUMBNAIL_SIZE, bookmark);
      drawThumbnail(pixels, thumbnailCanvas, THUMBNAIL_SIZE);
    });
    const maxIterations = $("#max-iterations", bookmarkModal);
    maxIterations.text(bookmark.maxIterations);
    const maxIterationsRange = $("#max-iterations-range", bookmarkModal);
    if (isWebGL2()) {
      maxIterationsRange
        .attr("min", C.MIN_ITERATIONS)
        .attr("max", C.MAX_ITERATIONS_MANUAL)
        .attr("step", C.DELTA_ITERATIONS)
        .val(bookmark.maxIterations);
      maxIterationsRange.on("input", (e) => {
        bookmark.maxIterations = Number(e.target.value);
        maxIterations.text(bookmark.maxIterations);
        const pixels = renderThumbnail(THUMBNAIL_SIZE, bookmark);
        drawThumbnail(pixels, thumbnailCanvas, THUMBNAIL_SIZE);
      });
    } else {
      maxIterationsRange.hide();
    }
    $(".region-bottom-left", bookmarkModal).text(
      `(${bookmark.regionBottomLeft.x}, ${bookmark.regionBottomLeft.y})`
    );
    $(".region-top-right", bookmarkModal).text(
      `(${bookmark.regionTopRight.x}, ${bookmark.regionTopRight.y})`
    );
    const juliaConstantP = $(".julia-constant", bookmarkModal);
    const juliaConstantDiv = juliaConstantP.closest("div");
    if (bookmark.fractalSetId === C.FRACTAL_SET_ID_JULIA) {
      juliaConstantP.text(`(${bookmark.juliaConstant.x}, ${bookmark.juliaConstant.y})`);
      juliaConstantDiv.show();
    } else {
      juliaConstantDiv.hide();
    }
    bookmarkModal.modal();
  };

  const presentManageBookmarksModal = (bookmarks) => {
    console.log("[presentManageBookmarksModal]", "bookmarks:", bookmarks);
    const manageBookmarksModal = $("#manageBookmarksModal")
      .on("show.bs.modal", onModalOpen)
      .on("hide.bs.modal", onModalClose);
    const tbody = $("tbody", manageBookmarksModal).empty();
    const invokeHandler = (handler, bookmark) => () => {
      manageBookmarksModal.modal("hide");
      handler(bookmark);
    };
    const onSwitchTo = (bookmark) => switchToBookmark(bookmark);
    const onEdit = (bookmark) => presentBookmarkModal(bookmark);
    const onDelete = (bookmark) => {
      deleteBookmark(bookmark);
    };
    const bookmarkRowTemplate = document.getElementById("bookmark-row-template");
    bookmarks.forEach((bookmark) => {
      const tr = document.importNode(bookmarkRowTemplate.content, true);
      const name = tr.querySelector(":nth-child(2)");
      const editButton = tr.querySelector(":nth-child(3) i");
      const deleteButton = tr.querySelector(":nth-child(4) i");
      const thumbnailCanvas = tr.querySelector(":nth-child(1) canvas");
      const pixels = renderThumbnail(THUMBNAIL_SIZE, bookmark);
      drawThumbnail(pixels, thumbnailCanvas, THUMBNAIL_SIZE);
      name.innerText = bookmark.name;
      thumbnailCanvas.addEventListener("click", invokeHandler(onSwitchTo, bookmark));
      editButton.addEventListener("click", invokeHandler(onEdit, bookmark));
      deleteButton.addEventListener("click", invokeHandler(onDelete, bookmark));
      tbody.append(tr);
    });
    manageBookmarksModal.modal();
  };

  return {
    presentBookmarkModal,
    presentManageBookmarksModal,
  };
};
