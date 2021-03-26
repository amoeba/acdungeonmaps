       private static void GenerateLandBlockTiles(CLandBlockInfo landBlockInfo) {
            foreach (var cell in landBlockInfo.Cells) {
                if (eids.Contains(cell.EnvironmentId)) continue;
                //if (cell.EnvironmentId != 80) continue;

                foreach (CCellStruct c in cell.environment.Cells) {
                    foreach (CswVertex vertex in c.VertexArray.Vertices.Reverse())
                        Console.WriteLine($"v {vertex.Vertex.X} {vertex.Vertex.Y} {vertex.Vertex.Z}");
                }

                eids.Add(cell.EnvironmentId);

                var e = cell.environment;

                var r = "";

                var bitmap = new Bitmap(10, 10);

                var floorBrush = new SolidBrush(Color.FromArgb(0, 127, 191));
                var wallPen = new Pen(new SolidBrush(Color.FromArgb(0, 0, 127)));

                var isValid = false;
                using (var graphics = Graphics.FromImage(bitmap)) {
                    //graphics.TranslateTransform(5, 5);
                    //graphics.Clear(Color.Black);

                    List<Surface> surfaces = new List<Surface>();

                    foreach (CCellStruct c in e.Cells) {
                        foreach (CPolygon polygon in c.Polygons) {
                            var surface = new Surface();
                            var points = new List<PointF>();

                            foreach (var vid in polygon.VertexIds) {
                                var v = new Vertex(c.VertexArray.Vertices[vid].Vertex.X, c.VertexArray.Vertices[vid].Vertex.Y, c.VertexArray.Vertices[vid].Vertex.Z);
                                surface.AddVertex(v);
                            }

                            if (surface.IsFloor || surface.IsWall) {
                                if (surface.Vertices.Count > 2) {
                                    if (surface.IsWall && polygon.Strippling != 1) continue;
                                    if (surface.IsFloor) {
                                        Console.WriteLine("surface: " + cell.Surfaces[polygon.PosSurface]);
                                        if (cell.Surfaces[polygon.PosSurface] == 134217780) {
                                            continue;
                                        }
                                    }
                                    surfaces.Add(surface);
                                }
                            }
                        }
                    }

                    var hasFloor = false;

                    foreach (var surface in surfaces) {
                        if (surface.IsFloor) {

                            isValid = true;
                            hasFloor = true;
                            var points = new List<PointF>();
                            foreach (var vert in surface.Vertices) {
                                var x = (float)((vert.X > 0) ? Math.Ceiling(vert.X - 1) : Math.Floor(vert.X)) + 5F;
                                var y = (float)((vert.Y > 0) ? Math.Ceiling(vert.Y - 1) : Math.Floor(vert.Y)) + 5F;
                                points.Add(new PointF(x, y));
                            }
                            graphics.FillPolygon(floorBrush, points.ToArray());
                            graphics.DrawPolygon(new Pen(floorBrush), points.ToArray());
                        }
                    }

                    foreach (var surface in surfaces) {
                        if (hasFloor && surface.IsWall) {
                            isValid = true;
                            var points = new List<PointF>();
                            foreach (var vert in surface.Vertices) {
                                var x = (float)((vert.X > 0) ? Math.Ceiling(vert.X - 1) : Math.Floor(vert.X)) + 5F;
                                var y = (float)((vert.Y > 0) ? Math.Ceiling(vert.Y - 1) : Math.Floor(vert.Y)) + 5F;
                                if (vert.Z != 0) continue;
                                points.Add(new PointF(x, y));
                            }
                            if (points.Count > 1) {
                                graphics.DrawLine(wallPen, points[0], points[1]);

                            }
                        }
                    }

                    graphics.Save();

                    bitmap.RotateFlip(RotateFlipType.RotateNoneFlipY);
                }

                if (isValid) {
                    bitmap.Save(@"E:\tiles\" + cell.EnvironmentId + ".bmp");
                }
            }
        }