using System;
using System.IO;
using System.Text;

using ACE.DatLoader;
using ACE.DatLoader.FileTypes;
using ACE.DatLoader.Entity;

namespace CellProcessor
{
  class Program
  {
    static void Main(string[] args)
    {
      string datPath = Path.Combine("/Users", "bryce", "tmp");

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

      for (var i = 0; i < landblockInfo.NumCells; i++)
      {
        EnvCell envcell = DatManager.CellDat.ReadFromDat<EnvCell>(cellID++);
        Console.WriteLine($"EnvCell: 0x{cellID:X8}");

        uint z = (uint)envcell.Position.Origin.Z;

        List<CellPortal> portals = envcell.CellPortals;

        for (var j = 0; j < portals.Count; j++)
        {
          uint otherCellId = portals[j].OtherCellId | ((uint)fileId & 0xFFFF0000);

          EnvCell targetCell = DatManager.CellDat.ReadFromDat<EnvCell>(otherCellId);

          if (targetCell.Id == 0)
          {
            Console.WriteLine("404");

            return;
          }

          uint targetZ = (uint)targetCell.Position.Origin.Z;

          // Console.WriteLine($"{z} vs. {targetZ}");

          var candidate = z != targetZ;

          // sw.WriteLine("landblock_id,cell_id,environment_id,x,y,z,rotation,candidate");
          var line = $"{landblockIdShort},{envcell.Id:X},{envcell.EnvironmentId},{envcell.Position.Origin.X},{envcell.Position.Origin.Y},{envcell.Position.Origin.Z},{envcell.Position.Orientation.W},{candidate}";
          sw.WriteLine(line);
        }
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
