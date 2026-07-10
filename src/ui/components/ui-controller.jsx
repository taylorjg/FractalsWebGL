import { useCallback, useEffect, useState } from "react";
import { BookmarkDialog } from "./bookmark-dialog";
import { ManageBookmarksDialog } from "./manage-bookmarks-dialog";

export const UiController = ({
  renderThumbnail,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  switchToBookmark,
  fractalSets,
  colourMaps,
  onModalOpen,
  onModalClose,
  registerActions,
}) => {
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [bookmark, setBookmark] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  const anyDialogOpen = bookmarkDialogOpen || manageDialogOpen;

  useEffect(() => {
    if (anyDialogOpen) {
      onModalOpen();
    } else {
      onModalClose();
    }
  }, [anyDialogOpen, onModalOpen, onModalClose]);

  const closeAllDialogs = useCallback(() => {
    setBookmarkDialogOpen(false);
    setManageDialogOpen(false);
    setBookmark(null);
    setBookmarks([]);
  }, []);

  const presentBookmarkModal = useCallback((nextBookmark) => {
    console.log("[presentBookmarkModal]", "bookmark:", nextBookmark);
    setManageDialogOpen(false);
    setBookmark(nextBookmark);
    setBookmarkDialogOpen(true);
  }, []);

  const presentManageBookmarksModal = useCallback((nextBookmarks) => {
    console.log("[presentManageBookmarksModal]", "bookmarks:", nextBookmarks);
    setBookmarkDialogOpen(false);
    setBookmark(null);
    setBookmarks(Array.from(nextBookmarks.values()));
    setManageDialogOpen(true);
  }, []);

  useEffect(() => {
    registerActions({
      presentBookmarkModal,
      presentManageBookmarksModal,
    });
  }, [registerActions, presentBookmarkModal, presentManageBookmarksModal]);

  const handleBookmarkSave = (savedBookmark, hasId) => {
    if (hasId) {
      updateBookmark(savedBookmark);
    } else {
      addBookmark(savedBookmark);
    }
    closeAllDialogs();
  };

  const handleSwitchTo = (selectedBookmark) => {
    closeAllDialogs();
    switchToBookmark(selectedBookmark);
  };

  const handleEdit = (selectedBookmark) => {
    setManageDialogOpen(false);
    setBookmark({ ...selectedBookmark });
    setBookmarkDialogOpen(true);
  };

  const handleDelete = (selectedBookmark) => {
    deleteBookmark(selectedBookmark);
    setBookmarks((current) => current.filter((item) => item.id !== selectedBookmark.id));
  };

  return (
    <>
      <BookmarkDialog
        open={bookmarkDialogOpen}
        bookmark={bookmark}
        fractalSets={fractalSets}
        colourMaps={colourMaps}
        renderThumbnail={renderThumbnail}
        onSave={handleBookmarkSave}
        onClose={closeAllDialogs}
      />
      <ManageBookmarksDialog
        open={manageDialogOpen}
        bookmarks={bookmarks}
        renderThumbnail={renderThumbnail}
        onSwitchTo={handleSwitchTo}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClose={closeAllDialogs}
      />
    </>
  );
};
