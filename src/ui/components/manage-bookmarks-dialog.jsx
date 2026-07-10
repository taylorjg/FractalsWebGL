import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { drawThumbnail } from "@app/ui/thumbnail-canvas";
import { thumbnailStyle } from "@app/ui/theme";

const THUMBNAIL_SIZE = 64;

const BookmarkRow = ({ bookmark, renderThumbnail, onSwitchTo, onEdit, onDelete }) => {
  const thumbnailCanvasRef = useRef(null);

  useEffect(() => {
    if (!thumbnailCanvasRef.current) return;
    const pixels = renderThumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE, bookmark);
    drawThumbnail(pixels, thumbnailCanvasRef.current, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  }, [bookmark, renderThumbnail]);

  return (
    <TableRow>
      <TableCell sx={{ width: THUMBNAIL_SIZE + 16, whiteSpace: "nowrap", px: 1 }}>
        <canvas
          ref={thumbnailCanvasRef}
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
          onClick={() => onSwitchTo(bookmark)}
          style={thumbnailStyle}
        />
      </TableCell>
      <TableCell
        sx={{
          width: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {bookmark.name}
      </TableCell>
      <TableCell align="center" sx={{ width: 48, whiteSpace: "nowrap", px: 0.5 }}>
        <IconButton aria-label="Edit bookmark" onClick={() => onEdit(bookmark)} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell align="center" sx={{ width: 48, whiteSpace: "nowrap", px: 0.5 }}>
        <IconButton aria-label="Delete bookmark" onClick={() => onDelete(bookmark)} size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export const ManageBookmarksDialog = ({
  open,
  bookmarks,
  renderThumbnail,
  onSwitchTo,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Bookmarks</DialogTitle>
      <DialogContent>
        {bookmarks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No bookmarks saved yet.
          </Typography>
        ) : (
          <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
            <TableBody>
              {bookmarks.map((bookmark) => (
                <BookmarkRow
                  key={bookmark.id}
                  bookmark={bookmark}
                  renderThumbnail={renderThumbnail}
                  onSwitchTo={onSwitchTo}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
