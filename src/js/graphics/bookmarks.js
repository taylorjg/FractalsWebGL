export const configureBookmarks = (ctx) => {
  const loadBookmarks = () => {
    const entries = JSON.parse(localStorage.bookmarks || "[]");
    for (const [id, bookmark] of entries) {
      const { thumbnail: _thumbnail, ...bookmarkWithoutThumbnail } = bookmark;
      ctx.bookmarks.set(id, bookmarkWithoutThumbnail);
    }
  };

  const saveBookmarks = () => {
    localStorage.bookmarks = JSON.stringify(Array.from(ctx.bookmarks.entries()));
  };

  const addBookmark = (bookmark) => {
    bookmark.id = ctx.nextBookmarkId++;
    ctx.bookmarks.set(bookmark.id, bookmark);
    saveBookmarks();
  };

  const updateBookmark = (bookmark) => {
    ctx.bookmarks.set(bookmark.id, bookmark);
    saveBookmarks();
  };

  const deleteBookmark = (bookmark) => {
    ctx.bookmarks.delete(bookmark.id);
    saveBookmarks();
  };

  const createBookmark = (name) => ({
    name: name || `Bookmark ${ctx.nextBookmarkId}`,
    fractalSetId: ctx.currentFractalSetId,
    juliaConstant: { ...ctx.currentJuliaConstant },
    colourMapId: ctx.currentColourMapId,
    regionBottomLeft: { ...ctx.region.bottomLeft },
    regionTopRight: { ...ctx.region.topRight },
    maxIterations: ctx.currentMaxIterations,
  });

  const onModalOpen = () => {
    ctx.modalOpen = true;
  };

  const onModalClose = () => {
    ctx.modalOpen = false;
  };

  return {
    loadBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    createBookmark,
    onModalOpen,
    onModalClose,
  };
};
