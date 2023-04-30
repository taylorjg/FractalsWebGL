import * as C from "./constants";

export const configureUI = ({
  addBookmark,
  updateBookmark,
  deleteBookmark,
  switchToBookmark,
  fractalSets,
  colourMaps,
  onModalOpen,
  onModalClose,
}) => {
  const canvas = document.getElementById("canvas");

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
    const thumbnailImg = $("img.thumbnail", bookmarkModal);
    const thumbnailCanvas = $("canvas.thumbnail", bookmarkModal);
    if (hasId) {
      thumbnailCanvas.hide();
      thumbnailImg.show();
      thumbnailImg[0].src = bookmark.thumbnail;
    } else {
      thumbnailImg.hide();
      thumbnailCanvas.show();
      const swidth = Math.min(canvas.width, canvas.height);
      const sheight = Math.min(canvas.width, canvas.height);
      const sx = (canvas.width - swidth) / 2;
      const sy = (canvas.height - sheight) / 2;
      const thumbnailCanvasElement = thumbnailCanvas[0];
      const thumbnailCtx = thumbnailCanvasElement.getContext("2d");
      const dwidth = thumbnailCanvasElement.width;
      const dheight = thumbnailCanvasElement.height;
      thumbnailCtx.drawImage(
        canvas,
        sx,
        sy,
        swidth,
        sheight,
        0,
        0,
        dwidth,
        dheight
      );
      bookmark.thumbnail = thumbnailCanvasElement.toDataURL("image/jpeg", 1.0);
    }
    $("#name", bookmarkModal).val(bookmark.name).focus();
    $(".fractal-set", bookmarkModal).text(
      fractalSets.get(bookmark.fractalSetId).name
    );
    $(".colour-map", bookmarkModal).text(
      colourMaps.get(bookmark.colourMapId).name
    );
    $(".max-iterations", bookmarkModal).text(bookmark.maxIterations);
    $(".region-bottom-left", bookmarkModal).text(
      `(${bookmark.regionBottomLeft.x}, ${bookmark.regionBottomLeft.y})`
    );
    $(".region-top-right", bookmarkModal).text(
      `(${bookmark.regionTopRight.x}, ${bookmark.regionTopRight.y})`
    );
    const juliaConstantP = $(".julia-constant", bookmarkModal);
    const juliaConstantDiv = juliaConstantP.closest("div");
    if (bookmark.fractalSetId === C.FRACTAL_SET_ID_JULIA) {
      juliaConstantP.text(
        `(${bookmark.juliaConstant.x}, ${bookmark.juliaConstant.y})`
      );
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
    const bookmarkRowTemplate = document.getElementById(
      "bookmark-row-template"
    );
    bookmarks.forEach((bookmark) => {
      const tr = document.importNode(bookmarkRowTemplate.content, true);
      const img = tr.querySelector(":nth-child(1) img");
      const name = tr.querySelector(":nth-child(2)");
      const editButton = tr.querySelector(":nth-child(3) i");
      const deleteButton = tr.querySelector(":nth-child(4) i");
      img.src = bookmark.thumbnail;
      name.innerText = bookmark.name;
      img.addEventListener("click", invokeHandler(onSwitchTo, bookmark));
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
