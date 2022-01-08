package mouveMose.src.mouse;
import  java.awt.Robot;
import java.awt.event.*;

import mouveMose.src.resolution.resolution;


public class mouseMouve{

    private float pourcentageWidth  ;
    private float pourcentageHeight ;
    private String direction;
    private String directions;
   
//________________________Getters / setteurs__________________________________
    
    public float getpourcentageWidth() {
        return pourcentageWidth;
    }
    
    public String getDirections() {
        return directions;
    }

    public String getDirection() {
        return direction;
    }

    public float getpourcentageHeight() {
        return pourcentageHeight;
    }
    
//____________________________________FIN____________________________________


//_________Import des résolutions depuis la classe resolution.java_________

    //retourne un entier = largeur de l'écran
    public int width () {
 
        resolution screenResolution = new resolution();
        return (screenResolution.widthToInt());
    }
    
    //retourne un entier = longueure de l'écran
    public int height(){
        resolution screenResolution = new resolution();
        return (screenResolution.HeightToInt());
    }

//____________________________________FIN____________________________________

    //permet de bouger la souris sur lecran, grace aux axes abscices et ordoné
    public void mouvingCursor(Float pourcentageHeight, Float pourcentageWidth) {

        this.pourcentageWidth = pourcentageWidth ;
        this.pourcentageHeight = pourcentageHeight;

            // Récupere la hauteur de l'écran et prend le pourcentage indiqué ici : 50%
            //on force le typage en int pour que toolkit puisse prendre la valeur
            float widthInFloat = width() * (pourcentageWidth / 100) ;
            int width = (int)widthInFloat;

            // Récupere la largeur de l'écran et prend le pourcentage indiqué ici : 50%
            //on force le typage en int pour que toolkit puisse prendre la valeur
            float heightInFloat = height() * (pourcentageHeight / 100) ;
            int height = (int)heightInFloat;
        
            try{
                Robot objMouse = new Robot();
                objMouse.mouseMove(width,height);
            }
            catch (Exception e){
            System.out.println("Le probleme est le suivant :"+e.getMessage());
                }
    }
    // permet de faire un click gauche (press and release)
    // ??? je ne sais pas pk j'ai mis un int en para ???
    public static void  clickMouse( int number){

        try{
            Robot objMouse = new Robot();

            for(int i =0;i<number;i++){
                objMouse.mousePress(InputEvent.BUTTON1_MASK);
                objMouse.mouseRelease(InputEvent.BUTTON1_MASK);
            }
        }
        catch (Exception e){
          System.out.println("Le probleme est le suivant :"+e.getMessage());
        }
    }
    
    public double systemout (float pourcentageWidth, float pourcentageHeight){
        
        this.pourcentageWidth = pourcentageWidth ;
        this.pourcentageHeight = pourcentageHeight;

        
        // Récupere la hauteur de l'écran et prend le pourcentage indiqué ici : 50%
        //on force le typage en int pour que toolkit puisse prendre la valeur
        float widthInFloat = width() * (pourcentageWidth / 100) ;
        int width = (int)widthInFloat;

        // Récupere la largeur de l'écran et prend le pourcentage indiqué ici : 50%
        //on force le typage en int pour que toolkit puisse prendre la valeur
        float heightInFloat = height() * (pourcentageHeight / 100) ;
        int height = (int)heightInFloat;

        System.out.println("Width: " + width);
        System.out.println("height: " + height);

        return width;
    
    }
    
    //permet d'appler la souri et de lui donner un emplacement prédefinit.
    public void callMouse(String direction){
       // this.setDirection(direction);

        if (direction == "L"){
            pourcentageHeight = 50;
            pourcentageWidth = 10;
            mouvingCursor(pourcentageHeight, pourcentageWidth);
            clickMouse(1);
        }

        if (direction == "R"){
            pourcentageHeight = 50;
            pourcentageWidth = 90;
            mouvingCursor(pourcentageHeight, pourcentageWidth);
            clickMouse(1);
        }

        if (direction == "D"){
            pourcentageHeight = 90;
            pourcentageWidth = 50;
            mouvingCursor(pourcentageHeight, pourcentageWidth);
            clickMouse(1);
        }

        if (direction == "U"){
            pourcentageHeight = 10;
            pourcentageWidth = 50;
            mouvingCursor(pourcentageHeight, pourcentageWidth);
            clickMouse(1);
        }

        if (direction == "M"){
            pourcentageHeight = 50;
            pourcentageWidth = 50;
            mouvingCursor(pourcentageHeight, pourcentageWidth);
            clickMouse(1);
        }

        if (direction == "test"){
            pourcentageHeight = 50;
            pourcentageWidth = 30;
            systemout(pourcentageWidth, pourcentageHeight);
        }
    }

    public String[] directionByString(){
        return this.directions.split(",");
    }
    public mouseMouve(String direction){
      //  this.setDirection(direction);
        callMouse(direction);
    }

    public static void main(String[] args) {

        new mouseMouve("R");
        }

    }