environment_ids <- as.numeric(gsub("\\.bmp", "", dir("static/tiles")))
landblocks <- read.csv("data/landblocks.csv")
landblocks_clean <- landblocks[landb
write.csv(landblocks_clean, "./data/landblocks-clean.csv", row.names = FALSE)