using System;

using ACE.DatLoader;
using ACE.DatLoader.FileTypes;
using System.IO;
using System.Text;
using Environment = ACE.DatLoader.FileTypes.Environment;
using ACE.DatLoader.Entity;

namespace CellProcessor
{
    class Program
    {
        static void Main(string[] args)
        {
            // Windows 1252 support
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            // Set up Cell file
            string datFile = Path.Combine("C:", "AC");
            DatManager.Initialize(datFile);

            WriteCells();
        }

        static void WriteCells()
        {
            // Set up destination file
            FileStream fs = new FileStream("landblocks.csv", FileMode.Truncate);
            StreamWriter sw = new StreamWriter(fs);
            sw.WriteLine("landblock_id,x,y,z,rotation,environment_id");

            foreach (var entry in DatManager.CellDat.AllFiles)
            {
                if ((entry.Key & 0xFFFF) == 0xFFFE)
                {
                    LandblockInfo landblockInfo = DatManager.CellDat.ReadFromDat<LandblockInfo>(entry.Key);
                    string landblockIdString = $"{landblockInfo.Id:X8}";
                    Console.WriteLine($"Dugeon Found: {landblockIdString}");

                    // Create familiar landblock code
                    string landblockIdShort = landblockIdString.Substring(0, 4);

                    // Print out cell info
                    var startCell = landblockInfo.Id & 0xFFFF0000 | 0x100;
                    var cellID = startCell;

                    for (var i = 0; i < landblockInfo.NumCells; i++)
                    {
                        EnvCell envcell = DatManager.CellDat.ReadFromDat<EnvCell>(cellID++);

                        var line = $"{landblockIdShort},{envcell.Position.Origin.X},{envcell.Position.Origin.Y},{envcell.Position.Origin.Z},{envcell.Position.Orientation.W},{envcell.EnvironmentId}";
                        sw.WriteLine(line);
                    }
                }
            }

            sw.Close();
            fs.Close();
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
                    Environment env = DatManager.PortalDat.ReadFromDat<Environment>(entry.Key);

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
