message("Running clean_tiles.R")

environment_ids <- as.numeric(gsub("\\.bmp", "", dir("static/tiles")))
landblocks <- read.csv("data/tiles.csv")

nrows_before <- nrow(landblocks)

landblocks <- landblocks[landblocks$environment_id %in% environment_ids,]

nrows_after <- nrow(landblocks)

message(paste("Filtered", nrows_after - nrows_before, "rows"))

write.csv(landblocks, "./data/tiles.csv", row.names = FALSE)

message("Done")