package mouveMose.src.ocr;
import java.io.File;
  
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
  
public class ocr {
    public static void main(String[] args)
    {
        Tesseract tesseract = new Tesseract();

        try {
            tesseract.setDatapath("C:\\Users\\moi\\Documents\\Vscode\\Java\\Tess4J");
  
            // the path of your tess data folder
            // inside the extracted file
            String text
                = tesseract.doOCR(new File("C:\\Users\\moi\\Documents\\Vscode\\Java\\images\\test3.png"));
  
            // path of your image file
            System.out.print(text);
        }
        catch (TesseractException e) {
            e.printStackTrace();
            }
        }
}