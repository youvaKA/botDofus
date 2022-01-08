package mouveMose.src.resolution;
import java.awt.*;  

// cette classe permet de récuperer la résolution de l'écran en pixel 
public class resolution {

    private int width;
    private int height;

    Dimension screenSize = Toolkit.getDefaultToolkit().getScreenSize();
    
    Double widthInDouble = screenSize.getWidth();
    Double heightInDouble = screenSize.getHeight();
    //getters
    public int getWidth(){
        return this.width;
    }
    
    public int getHeight(){
        return this.height ;
    }
    //fin gertters

    //force typage de Double à Integer
    public int HeightToInt(){
        return this.height = heightInDouble.intValue();
    }

    public int widthToInt(){
        return this.width = widthInDouble.intValue();
    }
    //fin force typage

    //constructeur, ne prend aucun argument
    // pour récuperer les résolution il faut faire nomDuConstructeur.height ou nomDuConstructeur.width
    public resolution(){
        this.width = widthToInt();
        this.height = HeightToInt();
    
    }

    //Main à executer affiche dans le términal la résolution de l'écran.

    public static void main(String[] args) {

        resolution mysResolution = new resolution();

        System.out.println(mysResolution.height);
        System.out.println(mysResolution.width);
    }


}
