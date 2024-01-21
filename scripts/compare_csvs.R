library(dplyr)
library(readr)

# import
ub_df <- read_csv("~/src/acdungeonmaps/data/dungeons.csv")
vi_df <- read_csv("~/src/acdungeonmaps/vi2dungeons.csv")

# clean
vi_df <- vi_df |> 
  mutate(Landblock = toupper(format(as.hexmode(Landblock), width=4))) |> 
  rename(name = "VI2 Name", landblock_id = "Landblock") |> 
  select(landblock_id, name)

# analyze
nrow(ub_df)
# => 892
nrow(vi_df)
# => 1145

table(ub_df$landblock_id %in% vi_df$landblock_id)
# => 76 ub ids not in vi2
table(vi_df$landblock_id %in% ub_df$landblock_id)
# => 329 vi2 ids not in ub

# ub ids not in vi2 list
not_in_vi2 <- ub_df[which(!(ub_df$landblock_id %in% vi_df$landblock_id)),]

# vi2 ids not in ub list
not_in_ub <- vi_df[which(!(vi_df$landblock_id %in% ub_df$landblock_id)),]
