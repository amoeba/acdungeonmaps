library(jsonlite)
library(ggplot2)

theme_set(theme_bw())

cells <- fromJSON("~/src/ac-js/cells-marketplace.json")

load_cell <- function(id) {
  cell <- cells[[which(names(cells) == id)]]

  data.frame(id = id,
             environmentId = cell$environmentId,
             x = cell$placement$position$x,
             y = cell$placement$position$y,
             z = cell$placement$position$z,
             rw = cell$placement$rotation$w,
             rx = cell$placement$rotation$x,
             ry = cell$placement$rotation$y,
             rz = cell$placement$rotation$z)
}
cell_df <- do.call(rbind, lapply(names(cells), load_cell))

ggplot(cell_df) +
  geom_point(aes(x, y)) +
  facet_wrap(~ z)

ggplot(cell_df) +
  geom_tile(aes(x, y, fill = factor(environmentId)), width = 10, height = 10, color = "black") +
  facet_wrap(~ z) +
  guides(fill = "none")
