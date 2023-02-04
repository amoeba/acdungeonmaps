using System;
using System.IO;
using System.Text;

using ACE.DatLoader;
using ACE.DatLoader.FileTypes;
using ACE.DatLoader.Entity;
using ACE.Server.Physics.Common;

namespace CellProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            string datPath = Path.Combine("/Users", "bryce", "Downloads", "ac-updates");

            if (!Directory.Exists(datPath))
            {
                Console.WriteLine($"DAT path of {datPath} does not exist. Exiting.");
                return;
            }

            // Windows 1252 support
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            DatManager.Initialize(datPath);

            // Set up destination file
            FileStream fs = new FileStream("landblocks.csv", FileMode.Truncate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("landblock_id,cell_id,environment_id,x,y,z,rotation,candidate");

            try
            {
                // WriteCells(sw);
                WriteCell(sw, 0x8A02FFFE);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
            finally
            {
                sw.Close();
                fs.Close();
            }
        }

        static void WriteCells(StreamWriter sw)
        {
            foreach (var entry in DatManager.CellDat.AllFiles)
            {
                if ((entry.Key & 0xFFFF) != 0xFFFE)
                {
                    continue;
                }

                WriteCell(sw, entry.Key);
            }
        }

        static void WriteCell(StreamWriter sw, uint fileId)
        {
            LandblockInfo landblockInfo = DatManager.CellDat.ReadFromDat<LandblockInfo>(fileId);
            string landblockIdString = $"{landblockInfo.Id:X8}";
            Console.WriteLine($"Dugeon Found: 0x{landblockIdString}");
            Console.WriteLine($"numCells: {landblockInfo.NumCells}");

            // Create familiar landblock code
            string landblockIdShort = landblockIdString.Substring(0, 4);

            var startCell = landblockInfo.Id & 0xFFFF0000 | 0x100;
            // Console.WriteLine($"StartCell: 0x{startCell:X8}");
            var cellID = startCell;

            // Iterate over each Cell in the LB
            for (var i = 0; i < landblockInfo.NumCells; i++)
            {
                // Get each Cell's EnvCell
                // WTF is an EnvCell?
                ACE.DatLoader.FileTypes.EnvCell envcell = DatManager.CellDat.ReadFromDat<ACE.DatLoader.FileTypes.EnvCell>(cellID++);
                Console.WriteLine($"EnvCell: 0x{cellID:X8}");

                // foreach (CCellStruct c in cell.environment.Cells)
                // {
                //     foreach (CswVertex vertex in c.VertexArray.Vertices.Reverse())
                //         Console.WriteLine($"v {vertex.Vertex.X} {vertex.Vertex.Y} {vertex.Vertex.Z}");
                // }

                // Cell's Environment
                uint EnvironmentID = envcell.EnvironmentId;
                ACE.DatLoader.FileTypes.Environment environment = DatManager.PortalDat.ReadFromDat<ACE.DatLoader.FileTypes.Environment>(EnvironmentID);

                // Environment's CellStructure
                uint CellStructureID = envcell.CellStructure;
                ACE.DatLoader.Entity.CellStruct cellStruct = environment.Cells[CellStructureID];

                // CellStructure's Polygons
                Console.WriteLine($"Polygons: {cellStruct.Polygons.Count}");
                foreach (var polygon in cellStruct.Polygons)
                {
                    var surface = new Surface();

                    // Console.WriteLine(polygon.Value.NumPts);
                    foreach (var vid in polygon.Value.VertexIds)
                    {

                        var v = new Vertex(cellStruct.VertexArray.Vertices[(ushort)vid].Origin.X, cellStruct.VertexArray.Vertices[(ushort)vid].Origin.Y, cellStruct.VertexArray.Vertices[(ushort)vid].Origin.Z);
                        surface.AddVertex(v);
                    }

                    Console.WriteLine($"Surface is wall? {surface.IsWall()}");
                }


                // Console.WriteLine($"Cell has {cellStruct.VertexArray.Vertices.Count} vertices");
                // foreach (var vert in cellStruct.VertexArray.Vertices)
                // {
                //     // var surface = new ACE.DatLoader.FileTypes.Surface();
                //     Console.WriteLine($"<X: {vert.Value.Origin.X}, Y: {vert.Value.Origin.Y}, Z: {vert.Value.Origin.Z}>");

                // }







                uint z = (uint)envcell.Position.Origin.Z;

                // Why am I iterating over CellPortals?
                // WTF is a Portal?
                // List<CellPortal> portals = envcell.CellPortals;

                // for (var j = 0; j < portals.Count; j++)
                // {
                //     uint otherCellId = portals[j].OtherCellId | ((uint)fileId & 0xFFFF0000);

                //     ACE.DatLoader.FileTypes.EnvCell targetCell = DatManager.CellDat.ReadFromDat<ACE.DatLoader.FileTypes.EnvCell>(otherCellId);

                //     if (targetCell.Id == 0)
                //     {
                //         Console.WriteLine("404");

                //         return;
                //     }

                //     uint targetZ = (uint)targetCell.Position.Origin.Z;

                //     // Console.WriteLine($"{z} vs. {targetZ}");

                //     var candidate = z != targetZ;

                //     // START WIP to get the floor plane
                //     // 1: Environment
                //     // uint EnvironmentID = envcell.EnvironmentId;
                //     // ACE.DatLoader.FileTypes.Environment environment = DatManager.PortalDat.ReadFromDat<ACE.DatLoader.FileTypes.Environment>(EnvironmentID);

                //     // 2: CellStructure
                //     // uint CellStructureID = envcell.CellStructure;
                //     // ACE.DatLoader.Entity.CellStruct cellStruct = environment.Cells[CellStructureID];

                //     // 3: Physics Polygons
                //     // foreach (CCellStruct c in environment.Cells)
                //     // {
                //     //     foreach (CswVertex vertex in c.VertexArray.Vertices.Reverse())
                //     //         Console.WriteLine($"v {vertex.Vertex.X} {vertex.Vertex.Y} {vertex.Vertex.Z}");
                //     // }


                //     Console.WriteLine(cellStruct.PhysicsPolygons.Count);

                //     foreach (var pp in cellStruct.PhysicsPolygons)
                //     {
                //         Polygon poly = cellStruct.PhysicsPolygons[pp.Key];

                //         // TODO: Find the floor?
                //     }
                //     // END

                //     // sw.WriteLine("landblock_id,cell_id,environment_id,x,y,z,rotation,candidate");
                //     var line = $"{landblockIdShort},{envcell.Id:X},{envcell.EnvironmentId},{envcell.Position.Origin.X},{envcell.Position.Origin.Y},{envcell.Position.Origin.Z},{envcell.Position.Orientation.W},{candidate}";
                //     sw.WriteLine(line);
                // }
            }
        }

        static void WriteEnvironments()
        {
            foreach (var entry in DatManager.PortalDat.AllFiles)
            {
                //Console.Write(entry.Key);

                if (entry.Value.GetFileType(DatDatabaseType.Portal) == DatFileType.Environment)
                {
                    Console.WriteLine("Found environment..." + entry.Key);

                    // Get Env
                    ACE.DatLoader.FileTypes.Environment env = DatManager.PortalDat.ReadFromDat<ACE.DatLoader.FileTypes.Environment>(entry.Key);

                    Console.WriteLine("Cells count is " + env.Cells.Count.ToString());

                    //foreach (var cell in env.Cells)
                    //{
                    //    foreach (var poly in cell.Value.Polygons)
                    //    {
                    //        foreach (var vert in poly.Value.Vertices)
                    //        {
                    //            vert.Origin.X
                    //        }

                    //    }
                    //}
                }
            }
        }
    }
}
