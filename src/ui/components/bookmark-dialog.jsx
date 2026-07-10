import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import * as C from "@app/js/constants";
import * as U from "@app/js/utils";
import { thumbnailStyle } from "@app/ui/theme";

const THUMBNAIL_SIZE = 64;

const formatCoords = ({ x, y }) => `(${x}, ${y})`;

export const BookmarkDialog = ({
  open,
  bookmark,
  isWebGL2,
  fractalSets,
  colourMaps,
  renderThumbnail,
  onSave,
  onClose,
}) => {
  const thumbnailCanvasRef = useRef(null);
  const [name, setName] = useState("");
  const [colourMapId, setColourMapId] = useState(0);
  const [maxIterations, setMaxIterations] = useState(C.INITIAL_ITERATIONS);

  const hasId = bookmark && Number.isInteger(bookmark.id);
  const title = hasId ? "Edit Bookmark" : "Create Bookmark";
  const isJulia = bookmark?.fractalSetId === C.FRACTAL_SET_ID_JULIA;

  const drawThumbnailToCanvas = useCallback(
    (canvas) => {
      if (!canvas || !bookmark) return;
      const configuration = {
        ...bookmark,
        colourMapId,
        maxIterations,
      };
      const pixels = renderThumbnail(THUMBNAIL_SIZE, THUMBNAIL_SIZE, configuration);
      U.drawThumbnail(pixels, canvas, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
    },
    [bookmark, colourMapId, maxIterations, renderThumbnail]
  );

  const handleThumbnailCanvasRef = useCallback(
    (canvas) => {
      thumbnailCanvasRef.current = canvas;
      if (open && canvas) {
        drawThumbnailToCanvas(canvas);
      }
    },
    [open, drawThumbnailToCanvas]
  );

  useEffect(() => {
    if (!open || !bookmark) return;
    setName(bookmark.name ?? "");
    setColourMapId(bookmark.colourMapId);
    setMaxIterations(bookmark.maxIterations);
  }, [open, bookmark]);

  useEffect(() => {
    if (!open || !thumbnailCanvasRef.current) return;
    drawThumbnailToCanvas(thumbnailCanvasRef.current);
  }, [open, colourMapId, maxIterations, drawThumbnailToCanvas]);

  const handleDialogEntered = () => {
    if (thumbnailCanvasRef.current) {
      drawThumbnailToCanvas(thumbnailCanvasRef.current);
    }
  };

  const handleSave = () => {
    if (!bookmark) return;
    bookmark.name = name;
    bookmark.colourMapId = colourMapId;
    bookmark.maxIterations = maxIterations;
    onSave(bookmark, hasId);
  };

  if (!bookmark) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{ onEntered: handleDialogEntered }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            autoFocus
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box>
              <canvas
                ref={handleThumbnailCanvasRef}
                width={THUMBNAIL_SIZE}
                height={THUMBNAIL_SIZE}
                style={{ ...thumbnailStyle, cursor: "default", marginBottom: 8 }}
              />
              <Typography variant="subtitle2">Fractal</Typography>
              <Typography variant="body2" color="text.secondary">
                {fractalSets.get(bookmark.fractalSetId)?.name}
              </Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel id="colour-map-label">Colour Map</InputLabel>
              <Select
                labelId="colour-map-label"
                label="Colour Map"
                value={colourMapId}
                onChange={(e) => setColourMapId(Number(e.target.value))}
              >
                {Array.from(colourMaps.entries()).map(([id, colourMap]) => (
                  <MenuItem key={id} value={id}>
                    {colourMap.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ minWidth: 180 }}>
              <Typography variant="subtitle2">Max Iterations</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {maxIterations}
              </Typography>
              {isWebGL2 && (
                <Slider
                  min={C.MIN_ITERATIONS}
                  max={C.MAX_ITERATIONS_MANUAL}
                  step={C.DELTA_ITERATIONS}
                  value={maxIterations}
                  onChange={(_e, value) => setMaxIterations(value)}
                  valueLabelDisplay="auto"
                />
              )}
            </Box>
          </Stack>

          <Box>
            <Typography variant="subtitle2">Region Bottom Left</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCoords(bookmark.regionBottomLeft)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Region Top Right</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatCoords(bookmark.regionTopRight)}
            </Typography>
          </Box>

          {isJulia && (
            <Box>
              <Typography variant="subtitle2">Julia Constant</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCoords(bookmark.juliaConstant)}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
